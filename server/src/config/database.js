require('dotenv').config();
const { Sequelize } = require('sequelize');

// Tùy chọn chung. Rút gọn alias cột SQL (_0, _1...) để tránh bị PostgreSQL cắt ở giới hạn 63 ký tự khi join nhiều bảng.
const options = {
  dialect: 'postgres',
  minifyAliases: true,
  // nếu là development thì hiện câu lệnh sql còn không thì không hiện
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10, // tối đa 10 kết nối
    min: 0, // tối thiểu 0 kết nối
    acquire: 30000, // tối đa 30 giây để kết nối
    idle: 10000, // tối đa 10 giây để ngắt kết nối
  },
  // DB_SSL=true khi cơ sở dữ liệu bắt buộc SSL (kết nối qua địa chỉ công khai). Mạng nội bộ của Railway không cần.
  ...(process.env.DB_SSL === 'true' ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } } : {}),
};

// Có DATABASE_URL (Railway: ${{Postgres.DATABASE_URL}}) thì dùng luôn; không thì ghép từ DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD như khi chạy ở máy
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(
    process.env.DB_NAME || 'devhub_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...options,
    }
  );

module.exports = sequelize;
