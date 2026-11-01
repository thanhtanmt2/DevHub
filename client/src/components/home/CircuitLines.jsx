// Mạch điện lan ra từ địa cầu: đường mạch mảnh (chỉ đi ngang, dọc và chéo 45° như mạch in) kèm các vệt sáng chạy dọc.
// Hệ toạ độ 1000×1000 trùng với khung của NetworkGlobe (tâm 500,500, địa cầu bán kính ~310) nên mạch luôn bắt đầu đúng mép địa cầu.
// Chỉ trang trí: bị ẩn khỏi trình đọc màn hình; ở chế độ giảm chuyển động chỉ còn các đường mờ, không có vệt sáng.

const R0 = 322; // bán kính điểm bắt đầu (ngay ngoài mép địa cầu)
const DEG = Math.PI / 180;

// [góc xuất phát (độ, 0 = sang phải, 90 = xuống), các đoạn [hướng tuyệt đối (độ), chiều dài]]
const TRACES = [
  [-76, [[-90, 46], [-45, 44], [-90, 180]]],
  [-58, [[-45, 64], [0, 70], [-45, 46], [0, 130]]],
  [-42, [[-45, 36], [0, 130], [45, 34], [0, 190]]],
  [-26, [[0, 56], [-45, 40], [0, 110], [45, 40], [0, 210]]],
  [-10, [[0, 108], [45, 36], [0, 66], [-45, 36], [0, 230]]],
  [8, [[0, 78], [45, 44], [0, 120], [-45, 30], [0, 210]]],
  [24, [[0, 50], [45, 56], [0, 110], [45, 30], [0, 210]]],
  [40, [[45, 44], [0, 100], [45, 40], [0, 170]]],
  [58, [[45, 60], [90, 40], [45, 50], [0, 150]]],
  [76, [[90, 54], [45, 44], [90, 180]]],
];

function build() {
  return TRACES.map(([deg, legs], i) => {
    const a = deg * DEG;
    let x = 500 + R0 * Math.cos(a);
    let y = 500 + R0 * Math.sin(a);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (const [dir, len] of legs) {
      x += Math.cos(dir * DEG) * len;
      y += Math.sin(dir * DEG) * len;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, end: [x, y], delay: -((i * 1.37) % 4.4), dur: 4 + (i % 4) * 0.55 };
  });
}
const PATHS = build();

export default function CircuitLines({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className={`${className}`}
      style={{
        WebkitMaskImage: 'radial-gradient(circle closest-side, #000 76%, transparent 100%)',
        maskImage: 'radial-gradient(circle closest-side, #000 76%, transparent 100%)',
      }}
      fill="none"
      aria-hidden="true"
    >
      {PATHS.map((p, i) => (
        <g key={i}>
          <path d={p.d} stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <path
            d={p.d}
            pathLength="100"
            className="circuit-pulse"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
          />
          <circle cx={p.end[0]} cy={p.end[1]} r="4.5" className="fill-primary-600" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  );
}
