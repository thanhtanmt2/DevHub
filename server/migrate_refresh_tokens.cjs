// Đăng nhập nhiều thiết bị cùng lúc: mỗi lần đăng nhập là một dòng trong bảng refresh_tokens
// (trước đây users.refresh_token chỉ giữ 1 phiên nên đăng nhập máy này làm máy kia mất phiên).
// Chỉ lưu bản băm SHA-256 của token, không lưu token gốc.
// Các phiên còn hạn trong users.refresh_token được chuyển sang bảng mới (người đang đăng nhập không bị đăng xuất),
// sau đó cột cũ được xóa trắng để không còn token gốc nằm trong CSDL / file dump.
// Chạy: node migrate_refresh_tokens.cjs   (an toàn khi chạy lại nhiều lần)
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        user_agent VARCHAR(255),
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`);

    // Chuyển phiên cũ (token gốc) sang bảng mới nếu còn hạn
    const legacy = await sequelize.query(
      `SELECT id, refresh_token FROM users WHERE refresh_token IS NOT NULL AND refresh_token <> ''`,
      { type: 'SELECT' }
    );
    let moved = 0;
    for (const u of legacy) {
      const exp = jwt.decode(u.refresh_token)?.exp; // chỉ đọc hạn dùng, không cần khóa bí mật
      if (!exp || exp * 1000 <= Date.now()) continue;
      await sequelize.query(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
         VALUES (:id, :uid, :hash, :exp) ON CONFLICT (token_hash) DO NOTHING`,
        { replacements: {
          id: crypto.randomUUID(),
          uid: u.id,
          hash: crypto.createHash('sha256').update(u.refresh_token).digest('hex'),
          exp: new Date(exp * 1000),
        } }
      );
      moved++;
    }
    await sequelize.query(`UPDATE users SET refresh_token = NULL WHERE refresh_token IS NOT NULL`);

    console.log(`✅ Bảng refresh_tokens sẵn sàng (chuyển ${moved} phiên đang đăng nhập, đã xóa token gốc trong users.refresh_token)`);
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
