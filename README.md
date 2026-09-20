# DevHub – Nền Tảng Kết Nối Việc Làm & Nhân Sự IT

> **Đề tài Tiểu luận chuyên ngành – Công nghệ Phần mềm**
> Trường Đại học Công nghệ Kỹ thuật TP.HCM – Khoa CNTT

## Tổng quan

DevHub là nền tảng Hybrid Web Platform tích hợp:
1. **Sàn giao dịch việc làm IT** (Freelance / Remote / Part-time)
2. **Phân hệ quản lý dự án nội bộ** với Workspace Kanban

**Nhóm thực hiện:**
- Đào Minh Nhựt – 23110282
- Lê Thanh Tân – 23110316

**GVHD:** PGS.TS Hoàng Văn Dũng

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT (Access + Refresh Token) + RBAC |
| Email | Nodemailer + Gmail SMTP |

---

## Cài đặt & Chạy Local

### Yêu cầu
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone & cài đặt

```bash
git clone <repo-url>
cd tlcn

# Cài dependencies backend
cd server
npm install

# Cài dependencies frontend
cd ../client
npm install
```

### 2. Cấu hình môi trường

```bash
# Backend
cd server
cp .env.example .env
# Chỉnh sửa .env với thông tin DB và email của bạn
```

```bash
# Frontend
cd client
cp .env.example .env
```

### 3. Tạo database

```bash
# Tạo database PostgreSQL
createdb devhub_db

# Chạy migrations và seed data
cd server
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 4. Chạy development

```bash
# Terminal 1 – Backend (port 5000)
cd server
npm run dev

# Terminal 2 – Frontend (port 5173)
cd client
npm run dev
```

Mở trình duyệt tại: http://localhost:5173

---

## Tài khoản mặc định

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devhub.vn | Admin@123456 |

---

## Cấu trúc dự án

```
tlcn/
├── client/                 # React Frontend
│   └── src/
│       ├── api/            # Axios + API calls
│       ├── components/     # Reusable components
│       ├── contexts/       # React Context (Auth)
│       ├── layouts/        # Layout wrappers
│       ├── pages/          # Page components
│       └── utils/          # Helper functions
├── server/                 # Node.js Backend
│   └── src/
│       ├── config/         # DB config
│       ├── controllers/    # Business logic
│       ├── middleware/     # Auth, RBAC, validation
│       ├── models/         # Sequelize models (22 tables)
│       ├── routes/         # Express routes
│       ├── seeders/        # Initial data
│       └── utils/          # Helpers, email, token
├── DeCuongTieuLuan.md      # Đề cương gốc
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| GET | `/api/auth/verify-email/:token` | Xác thực email |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Làm mới access token |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password/:token` | Đặt lại mật khẩu |
| GET | `/api/auth/me` | Thông tin user hiện tại |

*(Các endpoints khác sẽ được bổ sung theo từng Phase)*

---

## Roles & Permissions

| Role | Phạm vi |
|------|---------|
| `ADMIN` | Toàn bộ hệ thống + Workspace nội bộ |
| `CANDIDATE` | Hồ sơ, ứng tuyển, tham gia Workspace |
| `EMPLOYER` | Đăng tin, tìm ứng viên (không có Workspace) |
