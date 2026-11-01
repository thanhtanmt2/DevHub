// Tạo lại src/components/home/globeLand.js — mặt nạ "đất liền" cho quả địa cầu ở hero trang chủ (NetworkGlobe.jsx).
//
// Cách dùng (chỉ cần khi muốn đổi mật độ chấm hoặc dữ liệu bản đồ; kết quả đã được commit sẵn):
//   cd client
//   npm i --no-save world-atlas@2 topojson-client@3 d3-geo@3
//   node scripts/gen-globe-land.mjs
//
// Ý tưởng: dựng N điểm Fibonacci phân bố đều trên mặt cầu; điểm nào rơi vào đất liền (Natural Earth 110m, miền công cộng,
// qua gói world-atlas) thì bật bit tương ứng. Phía client dựng lại đúng N điểm bằng cùng công thức nên chỉ cần lưu các bit (~2KB).
// Công thức điểm ở đây PHẢI khớp với buildLand() trong NetworkGlobe.jsx.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const here = path.dirname(fileURLToPath(import.meta.url));
const topo = JSON.parse(fs.readFileSync(path.join(here, '../node_modules/world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const N = 14000;
const golden = Math.PI * (3 - Math.sqrt(5));
const bits = new Uint8Array(Math.ceil(N / 8));
let count = 0;
for (let i = 0; i < N; i++) {
  const y = 1 - (2 * (i + 0.5)) / N;
  const r = Math.sqrt(1 - y * y);
  const th = i * golden;
  const x = r * Math.sin(th);
  const z = r * Math.cos(th);
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(x, z) * 180) / Math.PI;
  if (lat < -58) continue; // bỏ Nam Cực cho gọn
  if (geoContains(land, [lon, lat])) {
    bits[i >> 3] |= 1 << (i & 7);
    count++;
  }
}

const out = `// Dữ liệu sinh tự động bằng scripts/gen-globe-land.mjs (Natural Earth 110m, miền công cộng): ${count}/${N} điểm Fibonacci nằm trên đất liền.
// Không sửa tay; công thức dựng điểm phải khớp với NetworkGlobe.jsx.
export const GLOBE_POINTS = ${N};
export const LAND_BITS = '${Buffer.from(bits).toString('base64')}';
`;
fs.writeFileSync(path.join(here, '../src/components/home/globeLand.js'), out);
console.log(`Đã ghi globeLand.js: ${count}/${N} điểm đất liền`);
