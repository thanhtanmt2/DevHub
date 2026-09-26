require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'devhub_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // nếu là development thì hiện câu lệnh sql còn không thì không hiện 
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10, // tối đa 10 kết nối 
      min: 0, // tối thiểu 0 kết nối 
      acquire: 30000, // tối đa 30 giây để kết nối 
      idle: 10000, // tối đa 10 giây để ngắt kết nối 
    },
  }
);

module.exports = sequelize;
