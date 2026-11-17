require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Nạp database_dump.sql vào cơ sở dữ liệu Ở XA (ví dụ Postgres trên Railway) bằng MỘT lượt gửi.
// `npm run db:import` dùng psql gửi từng câu lệnh một và chờ phản hồi; với 5.000+ câu INSERT qua internet việc này mất cả chục phút.
// Ở đây cả file dump được gửi như một chuỗi nhiều câu lệnh (chạy trong một giao dịch: lỗi thì hoàn tác toàn bộ),
// sau đó chạy lại đúng danh sách migration của import-db.js. Không cần cài psql.
//
// Dùng (PowerShell, trong thư mục server):
//   $env:DB_HOST='xxx.proxy.rlwy.net'; $env:DB_PORT='12345'; $env:DB_USER='postgres'; $env:DB_NAME='railway'; $env:DB_PASSWORD='...'
//   npm run db:import:remote
// Cẩn thận: file dump XÓA và tạo lại các bảng của cơ sở dữ liệu mà DB_* trỏ tới.

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Chặn nạp nhầm vào cơ sở dữ liệu ở máy (đã có `npm run db:import` cho trường hợp đó)
const isLocal = ['', 'localhost', '127.0.0.1', '::1'].includes(DB_HOST || '');
if (isLocal && process.env.ALLOW_LOCAL_IMPORT !== 'true') {
  console.error('❌ DB_HOST đang trỏ về máy bạn (localhost). Script này chỉ dành cho cơ sở dữ liệu ở xa.');
  console.error('   Hãy đặt $env:DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME theo Postgres của Railway rồi chạy lại.');
  process.exit(1);
}

const dumpFile = path.join(__dirname, '..', 'database_dump.sql');
if (!fs.existsSync(dumpFile)) {
  console.error('❌ Không tìm thấy file database_dump.sql.');
  process.exit(1);
}

// Danh sách migration nằm trong import-db.js: lấy trực tiếp ở đó để luôn khớp, không phải chép lại
function loadMigrations() {
  const src = fs.readFileSync(path.join(__dirname, 'import-db.js'), 'utf8');
  const start = src.indexOf('const migrations = [');
  const end = src.indexOf("console.log('Đang chạy migration patch...')");
  if (start < 0 || end < 0) throw new Error('Không đọc được danh sách migration trong import-db.js (cấu trúc file đã đổi?)');
  const literal = src.slice(start + 'const migrations = '.length, end).trim().replace(/;$/, '');
  const localRequire = (p) => require(p.startsWith('.') ? path.join(__dirname, p) : p);
  return new Function('require', `return ${literal};`)(localRequire);
}

async function connect() {
  const base = {
    host: DB_HOST,
    port: Number(DB_PORT || 5432),
    user: DB_USER,
    password: DB_PASSWORD || '',
    database: DB_NAME,
    connectionTimeoutMillis: 20000,
  };
  // Ưu tiên SSL (Railway hỗ trợ), máy chủ không hỗ trợ thì thử lại không SSL
  try {
    const client = new Client({ ...base, ssl: { rejectUnauthorized: false } });
    await client.connect();
    return client;
  } catch (err) {
    if (!/SSL/i.test(err.message)) throw err;
    const client = new Client({ ...base, ssl: false });
    await client.connect();
    return client;
  }
}

(async () => {
  const t0 = Date.now();
  const seconds = () => ((Date.now() - t0) / 1000).toFixed(1);
  const migrations = loadMigrations();
  // Bỏ các lệnh riêng của psql (\restrict, \unrestrict) vì chúng không phải SQL
  const sql = fs.readFileSync(dumpFile, 'utf8').split(/\r?\n/).filter((l) => !/^\\(un)?restrict\b/.test(l)).join('\n');

  console.log(`Kết nối tới ${DB_HOST}:${DB_PORT || 5432}/${DB_NAME} ...`);
  let client = await connect();
  console.log(`Đang nạp dữ liệu (${(sql.length / 1024).toFixed(0)} KB, một lượt gửi) ...`);
  try {
    await client.query(sql);
  } catch (err) {
    console.error('❌ Lỗi khi nạp dữ liệu (đã hoàn tác, cơ sở dữ liệu không bị thay đổi):', err.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
  console.log(`✅ Nạp dữ liệu thành công! (${seconds()}s)`);
  await client.end();

  // File dump đặt search_path rỗng cho phiên của nó, nên migration chạy ở kết nối mới
  client = await connect();
  console.log(`Đang chạy ${migrations.length} migration ...`);
  let errors = 0;
  for (const m of migrations) {
    try {
      await client.query(m);
    } catch (err) {
      errors += 1;
      console.error(`  ⚠️  Migration lỗi: ${String(m).replace(/\s+/g, ' ').substring(0, 60)}... → ${err.message}`);
    }
  }
  const tables = await client.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'");
  const users = await client.query('SELECT count(*)::int AS n FROM users').catch(() => null);
  await client.end();

  console.log(errors === 0 ? '✅ Migration hoàn tất!' : `⚠️  ${errors} migration thất bại. Kiểm tra lỗi ở trên.`);
  console.log(`Có ${tables.rows[0].n} bảng${users ? `, ${users.rows[0].n} người dùng` : ''}. Tổng thời gian ${seconds()}s.`);
})().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
