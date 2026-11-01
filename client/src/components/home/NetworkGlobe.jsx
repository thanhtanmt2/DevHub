import { useEffect, useRef } from 'react';
import { GLOBE_POINTS, LAND_BITS } from '@/components/home/globeLand';

// Quả địa cầu kết nối ở hero: chấm đất liền xoay chậm, các "người dùng" rải khắp thế giới, những tia sáng bay theo cung tròn
// nối người với người (và nối về Việt Nam), hai vòng quỹ đạo có vệ tinh bao quanh — gợi một không gian chung cho mọi người.
// Vẽ bằng canvas 2D thuần (không thư viện): chỉ chạy khi đang hiện trên màn hình; chế độ "giảm chuyển động" chỉ vẽ một khung tĩnh.

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const SEG = 56; // số đoạn của mỗi cung nối
const SPIN = 0.085; // tốc độ quay (rad/giây)
const TILT = 20 * DEG; // nghiêng trục để thấy nhiều bán cầu bắc hơn
const START_ANGLE = -0.55 - 106 * DEG; // lúc đầu Việt Nam (kinh độ ~106°) hơi lệch trái tâm, rồi từ từ lướt qua giữa
const BUCKETS = 5;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const toVec = (lat, lon) => {
  const p = lat * DEG;
  const l = lon * DEG;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};

// [tên, vĩ độ, kinh độ, hiện biểu tượng người?, là đầu mối Việt Nam?]
const NODE_DEFS = [
  ['Hà Nội', 21.03, 105.85, true, true],
  ['TP. Hồ Chí Minh', 10.82, 106.63, true, true],
  ['Đà Nẵng', 16.05, 108.2, false, true],
  ['Singapore', 1.35, 103.82, true, false],
  ['Bangkok', 13.75, 100.5, false, false],
  ['Hong Kong', 22.3, 114.17, false, false],
  ['Tokyo', 35.68, 139.69, true, false],
  ['Seoul', 37.57, 126.98, false, false],
  ['Bangalore', 12.97, 77.59, true, false],
  ['Dubai', 25.2, 55.27, false, false],
  ['Sydney', -33.87, 151.21, true, false],
  ['London', 51.5, -0.12, true, false],
  ['Berlin', 52.52, 13.4, false, false],
  ['Paris', 48.86, 2.35, false, false],
  ['New York', 40.71, -74.0, true, false],
  ['San Francisco', 37.77, -122.42, false, false],
  ['Toronto', 43.65, -79.38, false, false],
  ['São Paulo', -23.55, -46.63, true, false],
  ['Cape Town', -33.92, 18.42, false, false],
  ['Nairobi', -1.29, 36.82, false, false],
];
const HUBS = NODE_DEFS.map((n, i) => (n[4] ? i : -1)).filter((i) => i >= 0);

// Hai vòng quỹ đạo: mặt phẳng nghiêng quanh trục X rồi xoay quanh trục Z (ở khung nhìn, không quay theo địa cầu)
const RINGS = [
  { rho: 1.36, tilt: 22 * DEG, rotZ: -16 * DEG, dash: null, alpha: 0.5, speed: 0.34, phase: 0.6 },
  { rho: 1.55, tilt: 64 * DEG, rotZ: 38 * DEG, dash: [2, 7], alpha: 0.42, speed: -0.24, phase: 3.4 },
];

// Dựng lại N điểm Fibonacci trên mặt cầu (đúng công thức lúc tạo dữ liệu) và giữ những điểm nằm trên đất liền
function buildLand() {
  const bin = atob(LAND_BITS);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out = [];
  for (let i = 0; i < GLOBE_POINTS; i++) {
    if (!(bin.charCodeAt(i >> 3) & (1 << (i & 7)))) continue;
    const y = 1 - (2 * (i + 0.5)) / GLOBE_POINTS;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden;
    out.push(r * Math.sin(th), y, r * Math.cos(th));
  }
  return new Float32Array(out);
}

function ringPoint(ring, phi) {
  const x0 = Math.cos(phi);
  const z0 = Math.sin(phi);
  const y1 = -z0 * Math.sin(ring.tilt);
  const z1 = z0 * Math.cos(ring.tilt);
  const cz = Math.cos(ring.rotZ);
  const sz = Math.sin(ring.rotZ);
  return [(x0 * cz - y1 * sz) * ring.rho, (x0 * sz + y1 * cz) * ring.rho, z1 * ring.rho];
}

export default function NetworkGlobe({ className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const probeRef = useRef(null); // phần tử ẩn mang class màu thương hiệu: canvas đọc màu từ đây để luôn khớp bảng màu
  const softRef = useRef(null);
  const deepRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !ctx) return undefined;
    // Màu lấy từ bảng màu thương hiệu qua các phần tử ẩn: đổi màu chủ đạo (biến --primary-* trong index.css) thì canvas tự đổi theo
    const rgbOf = (el, fallback) => { const m = el && getComputedStyle(el).color.match(/[\d.]+/g); return m ? `${m[0]},${m[1]},${m[2]}` : fallback; };
    const brand = (probeRef.current && getComputedStyle(probeRef.current).color) || '#376ee6';
    const SOFT = rgbOf(softRef.current, '219,234,254'); // sắc rất nhạt: quầng sáng, đầu tia
    const DEEP = rgbOf(deepRef.current, '30,58,95'); // sắc đậm: phần tối ở rìa địa cầu

    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const land = buildLand();
    const nodes = NODE_DEFS.map(([name, lat, lon, person, hub]) => ({ name, v: toVec(lat, lon), person, hub, ripple: -99 }));
    const buckets = Array.from({ length: BUCKETS }, () => new Float32Array((land.length / 3) * 2));
    const counts = new Int32Array(BUCKETS);
    const scr = new Float32Array((SEG + 1) * 2);
    const vis = new Uint8Array(SEG + 1);

    let size = 0;
    let dpr = 1;
    let R = 0;
    let cx = 0;
    let cy = 0;
    let angle = reduce ? START_ANGLE + 0.7 : START_ANGLE;
    let simT = 0;
    let beams = [];
    let nextSpawn = 0.2;
    let raf = 0;
    let last = 0;

    // ── phép quay: xoay quanh trục Y theo `angle`, rồi nghiêng quanh trục X
    let ca = 1; let sa = 0; let ct = 1; let st = 0;
    let rx = 0; let ry = 0; let rz = 0;
    const setView = () => { ca = Math.cos(angle); sa = Math.sin(angle); ct = Math.cos(TILT); st = Math.sin(TILT); };
    const rot = (x, y, z) => {
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;
      rx = x1;
      ry = y * ct - z1 * st;
      rz = y * st + z1 * ct;
    };
    // điểm có nhìn thấy không: nằm phía trước, hoặc nằm ngoài rìa đĩa cầu (cung bay cao hơn mặt đất)
    const visible = () => rz > 0 || rx * rx + ry * ry > 1;

    // ── tia sáng nối hai người
    const spawnBeam = (t, progress = 0) => {
      setView();
      for (let tries = 0; tries < 30; tries++) {
        const a = Math.random() < 0.42 ? HUBS[(Math.random() * HUBS.length) | 0] : (Math.random() * nodes.length) | 0;
        const b = (Math.random() * nodes.length) | 0;
        if (a === b || beams.some((x) => x.a === a && x.b === b)) continue;
        const A = nodes[a].v;
        const B = nodes[b].v;
        const theta = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
        if (theta < 0.5 || theta > 2.6) continue;
        rot(A[0], A[1], A[2]); const za = rz;
        rot(B[0], B[1], B[2]); const zb = rz;
        if (Math.max(za, zb) < -0.05) continue; // cần ít nhất một đầu quay về phía người xem
        const lift = 0.07 + 0.24 * Math.min(1, theta / 2.3); // cung càng dài càng bay cao
        const pts = new Float32Array((SEG + 1) * 3);
        const sinT = Math.sin(theta) || 1e-6;
        for (let i = 0; i <= SEG; i++) {
          const u = i / SEG;
          const s1 = Math.sin((1 - u) * theta) / sinT;
          const s2 = Math.sin(u * theta) / sinT;
          const r = 1 + lift * Math.sin(Math.PI * u);
          pts[i * 3] = (A[0] * s1 + B[0] * s2) * r;
          pts[i * 3 + 1] = (A[1] * s1 + B[1] * s2) * r;
          pts[i * 3 + 2] = (A[2] * s1 + B[2] * s2) * r;
        }
        const dur = 1.7 + theta * 0.75;
        beams.push({ a, b, t0: t - progress * dur, dur, pts, arrived: false, dead: false });
        if (progress === 0) nodes[a].ripple = t; // chớp sáng ở nơi tia bắt đầu bay
        return;
      }
    };

    const strokeSeg = (x0, y0, x1, y1, alpha, width) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    };

    const drawBeam = (b, t) => {
      const u = t - b.t0;
      if (u < 0) return;
      const p = clamp(u / b.dur, 0, 1);
      const head = easeInOut(p) * SEG;
      const after = u > b.dur ? clamp(1 - (u - b.dur) / 1.4, 0, 1) : 1;
      if (after <= 0) { b.dead = true; return; }
      if (u >= b.dur && !b.arrived) { b.arrived = true; nodes[b.b].ripple = t; }

      const lastI = Math.min(SEG, Math.ceil(head));
      for (let i = 0; i <= lastI; i++) {
        rot(b.pts[i * 3], b.pts[i * 3 + 1], b.pts[i * 3 + 2]);
        scr[i * 2] = cx + R * rx;
        scr[i * 2 + 1] = cy - R * ry;
        vis[i] = visible() ? 1 : 0;
      }
      // đường vết mờ từ điểm xuất phát tới đầu tia
      ctx.strokeStyle = `rgba(255,255,255,${0.4 * after})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let pen = false;
      const full = Math.floor(head);
      for (let i = 0; i <= full; i++) {
        if (!vis[i]) { pen = false; continue; }
        if (pen) ctx.lineTo(scr[i * 2], scr[i * 2 + 1]); else ctx.moveTo(scr[i * 2], scr[i * 2 + 1]);
        pen = true;
      }
      // đầu tia (nội suy giữa hai điểm)
      let hx = scr[full * 2];
      let hy = scr[full * 2 + 1];
      let headVisible = vis[full] === 1;
      if (full < SEG && full + 1 <= lastI) {
        const f = head - full;
        hx += (scr[(full + 1) * 2] - hx) * f;
        hy += (scr[(full + 1) * 2 + 1] - hy) * f;
        headVisible = headVisible && vis[full + 1] === 1;
        if (headVisible && pen) ctx.lineTo(hx, hy);
      }
      ctx.stroke();

      // đuôi sáng của tia: các đoạn ngắn đậm dần về phía đầu
      const comet = u > b.dur ? clamp(1 - (u - b.dur) / 0.5, 0, 1) : 1;
      if (comet > 0) {
        const tail = 15;
        const from = Math.max(0, full - tail);
        for (let i = from; i < full; i++) {
          if (!vis[i] || !vis[i + 1]) continue;
          const k = (i - from + 1) / (full - from + 1);
          strokeSeg(scr[i * 2], scr[i * 2 + 1], scr[(i + 1) * 2], scr[(i + 1) * 2 + 1], Math.pow(k, 1.4) * comet, 1 + 3 * k);
        }
        if (headVisible) {
          const gr = 26 * (R / 235);
          const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, gr);
          g.addColorStop(0, `rgba(255,255,255,${comet})`);
          g.addColorStop(0.28, `rgba(${SOFT},${0.65 * comet})`);
          g.addColorStop(1, `rgba(${SOFT},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(hx, hy, gr, 0, TAU); ctx.fill();
        }
      }
    };

    // ── vòng quỹ đạo: front=false vẽ nửa phía sau (mờ, bị địa cầu che), front=true vẽ nửa phía trước
    const drawRings = (front, t) => {
      for (const ring of RINGS) {
        ctx.strokeStyle = `rgba(255,255,255,${front ? ring.alpha : ring.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.setLineDash(ring.dash ? ring.dash.map((d) => d * (R / 235)) : []);
        ctx.beginPath();
        const M = 120;
        let pen = false;
        let [px, py, pz] = ringPoint(ring, 0);
        for (let j = 1; j <= M; j++) {
          const [qx, qy, qz] = ringPoint(ring, (j / M) * TAU);
          const zm = (pz + qz) / 2;
          const inDisk = ((px + qx) / 2) ** 2 + ((py + qy) / 2) ** 2 < 1;
          const show = front ? zm >= 0 : zm < 0 && !inDisk;
          if (show) {
            if (!pen) ctx.moveTo(cx + R * px, cy - R * py);
            ctx.lineTo(cx + R * qx, cy - R * qy);
            pen = true;
          } else pen = false;
          px = qx; py = qy; pz = qz;
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // vệ tinh chạy dọc quỹ đạo
        const [sx, sy, sz] = ringPoint(ring, ring.phase + t * ring.speed);
        const hidden = sz < 0 && sx * sx + sy * sy < 1;
        if (!hidden && (sz >= 0) === front) {
          const X = cx + R * sx;
          const Y = cy - R * sy;
          const g = ctx.createRadialGradient(X, Y, 0, X, Y, 11 * (R / 235));
          g.addColorStop(0, 'rgba(255,255,255,0.95)');
          g.addColorStop(0.4, `rgba(${SOFT},0.45)`);
          g.addColorStop(1, `rgba(${SOFT},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(X, Y, 11 * (R / 235), 0, TAU); ctx.fill();
        }
      }
    };

    const drawPerson = (x, y, r, a) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath(); ctx.arc(x, y, r + 3.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
      ctx.fillStyle = brand;
      ctx.beginPath(); ctx.arc(x, y - r * 0.22, r * 0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.82, r * 0.62, r * 0.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    };

    const drawNodes = (t) => {
      const sc = R / 235;
      for (const n of nodes) {
        rot(n.v[0], n.v[1], n.v[2]);
        if (rz < 0.03) continue;
        const a = clamp(rz / 0.28, 0, 1);
        const x = cx + R * rx;
        const y = cy - R * ry;
        // sóng lan ra khi một tia sáng tới nơi (và nhịp thở nhẹ ở các đầu mối Việt Nam)
        const radial = Math.atan2(-ry, rx);
        const wave = (k, strength) => {
          const rad = (6 + 30 * k) * sc;
          ctx.strokeStyle = `rgba(255,255,255,${strength * Math.pow(1 - k, 1.6) * a})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(x, y, rad, rad * (0.4 + 0.6 * rz), radial + Math.PI / 2, 0, TAU);
          ctx.stroke();
        };
        const age = t - n.ripple;
        if (age >= 0 && age < 1.5) wave(age / 1.5, 0.7);
        if (n.hub) wave((t * 0.42 + n.v[0] * 3) % 1, 0.4);

        if (n.person) {
          drawPerson(x, y, (n.hub ? 8.5 : 7) * sc * (0.8 + 0.2 * rz), a);
        } else {
          const r = (n.hub ? 3.4 : 2.6) * sc;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
          g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`);
          g.addColorStop(0.35, `rgba(${SOFT},${0.5 * a})`);
          g.addColorStop(1, `rgba(${SOFT},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        }
      }
    };

    // lưới kinh – vĩ tuyến mờ (dựng sẵn một lần)
    const graticule = [];
    for (let lon = 0; lon < 360; lon += 30) {
      const pts = [];
      for (let lat = -80; lat <= 80; lat += 8) pts.push(...toVec(lat, lon));
      graticule.push(new Float32Array(pts));
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lon = 0; lon <= 360; lon += 8) pts.push(...toVec(lat, lon));
      graticule.push(new Float32Array(pts));
    }

    const drawGraticule = () => {
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const line of graticule) {
        let pen = false;
        for (let i = 0; i < line.length; i += 3) {
          rot(line[i], line[i + 1], line[i + 2]);
          if (rz <= 0) { pen = false; continue; }
          if (pen) ctx.lineTo(cx + R * rx, cy - R * ry); else ctx.moveTo(cx + R * rx, cy - R * ry);
          pen = true;
        }
      }
      ctx.stroke();
    };

    const draw = (t) => {
      setView();
      ctx.clearRect(0, 0, size, size);

      // quầng sáng quanh địa cầu
      const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.55);
      halo.addColorStop(0, 'rgba(255,255,255,0.3)');
      halo.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.55, 0, TAU); ctx.fill();

      drawRings(false, t);

      // thân địa cầu
      const body = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.1, cx, cy, R);
      body.addColorStop(0, 'rgba(255,255,255,0.26)');
      body.addColorStop(0.55, 'rgba(255,255,255,0.08)');
      body.addColorStop(1, `rgba(${DEEP},0.30)`);
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      drawGraticule();

      // các chấm đất liền (gom theo độ sáng để vẽ theo lô cho nhanh)
      counts.fill(0);
      for (let i = 0; i < land.length; i += 3) {
        rot(land[i], land[i + 1], land[i + 2]);
        if (rz <= 0.03) continue;
        const b = Math.min(BUCKETS - 1, (rz * BUCKETS) | 0);
        const c = counts[b]++;
        buckets[b][c * 2] = cx + R * rx;
        buckets[b][c * 2 + 1] = cy - R * ry;
      }
      const dotR = Math.max(0.9, R * 0.0066);
      for (let b = 0; b < BUCKETS; b++) {
        if (!counts[b]) continue;
        const r = dotR * (0.62 + 0.1 * b);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + b * 0.18})`;
        ctx.beginPath();
        const arr = buckets[b];
        for (let k = 0; k < counts[b]; k++) {
          const x = arr[k * 2];
          const y = arr[k * 2 + 1];
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, TAU);
        }
        ctx.fill();
      }

      // tia sáng, người dùng (cộng sáng để có cảm giác phát quang trên nền xanh)
      ctx.globalCompositeOperation = 'lighter';
      for (const b of beams) drawBeam(b, t);
      ctx.globalCompositeOperation = 'source-over';
      drawNodes(t);

      drawRings(true, t);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      size = Math.max(1, Math.round(rect.width));
      dpr = Math.min(window.devicePixelRatio || 1, 2, 1500 / size);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = size / 2;
      cy = size / 2;
      R = size * 0.31;
      if (reduce) draw(simT);
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      simT += dt;
      angle += dt * SPIN;
      if (simT >= nextSpawn && beams.length < 11) {
        setView();
        spawnBeam(simT);
        nextSpawn = simT + 0.28 + Math.random() * 0.45;
      }
      if (beams.some((b) => b.dead)) beams = beams.filter((b) => !b.dead);
      draw(simT);
    };
    const start = () => { if (raf || reduce) return; last = performance.now(); raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    resize();
    // có sẵn vài tia đang bay ngay từ khung đầu tiên
    for (let i = 0; i < 6; i++) spawnBeam(simT, reduce ? 0.7 + Math.random() * 0.25 : 0.1 + Math.random() * 0.8);
    if (reduce) draw(simT);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) start(); else stop(); });
    io.observe(wrap);

    return () => { stop(); ro.disconnect(); io.disconnect(); };
  }, []);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <span ref={probeRef} className="hidden text-primary-600" />
      <span ref={softRef} className="hidden text-primary-100" />
      <span ref={deepRef} className="hidden text-primary-900" />
    </div>
  );
}
