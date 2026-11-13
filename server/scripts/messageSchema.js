// Tính năng tin nhắn kiểu Zalo: trả lời, thu hồi, thả cảm xúc, xóa ở phía mình, ghim tin nhắn, ghim hội thoại.
// Chạy lại được nhiều lần (IF NOT EXISTS).
//  - forum_messages.reply_to_id: tin được trả lời (xóa tin gốc thì chỉ mất liên kết)
//  - forum_messages.recalled_at: thời điểm người gửi thu hồi (nội dung bị xóa khỏi cơ sở dữ liệu)
//  - forum_messages.hidden_for_sender / hidden_for_recipient: "xóa ở phía tôi" — chỉ ẩn với người xóa, người kia vẫn thấy
//  - forum_messages.pinned_at / pinned_by: tin được ghim trong cuộc trò chuyện (cả hai bên cùng thấy, tối đa 3 tin)
//  - forum_message_reactions: mỗi người thả tối đa một cảm xúc cho mỗi tin nhắn
//  - forum_conversation_settings: cài đặt riêng của từng người cho mỗi cuộc trò chuyện (hiện chỉ có ghim lên đầu danh sách)
module.exports = [
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES forum_messages(id) ON DELETE SET NULL`,
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMPTZ`,
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS hidden_for_sender BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS hidden_for_recipient BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ`,
  `ALTER TABLE forum_messages ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS forum_message_reactions (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES forum_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(12) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (message_id, user_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_forum_message_reactions_message ON forum_message_reactions (message_id)`,
  `CREATE TABLE IF NOT EXISTS forum_conversation_settings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    peer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pinned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, peer_id)
  )`,
];
