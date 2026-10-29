const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// jwtid ngẫu nhiên: hai lần đăng nhập trong cùng một giây vẫn ra hai token khác nhau (mỗi thiết bị một phiên riêng)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    jwtid: crypto.randomUUID(),
  });
};

const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

module.exports = { generateAccessToken, generateRefreshToken, generateRandomToken };
