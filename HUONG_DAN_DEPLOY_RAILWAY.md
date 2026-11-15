# Hướng dẫn deploy DevHub lên Railway

DevHub chạy trên Railway dưới dạng **một dịch vụ duy nhất** (Express phục vụ cả API lẫn giao diện) cộng **một PostgreSQL** và **một Volume** để lưu file tải lên.
Chi phí dự kiến khoảng 5 đô mỗi tháng (gói Hobby). Tài khoản dùng thử có 5 đô trong 30 ngày.

## 0. Chuẩn bị (làm trước, không tốn tiền)

1. **Brevo (gửi email).** Railway chặn cổng SMTP nên không dùng Gmail SMTP được.
   - Đăng ký tại brevo.com (miễn phí).
   - Vào **Senders, Domains & Dedicated IPs → Senders → Add a sender**, thêm một địa chỉ email của bạn (ví dụ Gmail) và bấm liên kết xác minh trong thư Brevo gửi tới.
   - Vào **SMTP & API → API Keys → Generate a new API key**, chép khóa (dạng `xkeysib-...`).
2. **Google đăng nhập** (nếu dùng): sau khi có địa chỉ Railway (bước 5) vào Google Cloud Console → Credentials → OAuth client → **Authorized JavaScript origins** → thêm `https://<tên-miền>.up.railway.app`.
3. Có một thẻ Visa/Mastercard đã bật thanh toán quốc tế (cần khi nâng lên gói Hobby, Railway chỉ trả sau).

## 1. Tạo dự án và cơ sở dữ liệu

1. Railway → **New → Deploy PostgreSQL**. Đợi nó chạy xong (có dấu tích xanh).
2. Trong cùng dự án: **New → GitHub Repo → chọn DevHub**, chọn nhánh đang dùng (ví dụ `tuan11`).
   - Lần đầu Railway sẽ tự build theo `package.json` ở thư mục gốc (đã chuẩn bị sẵn). Lần build đầu có thể báo lỗi vì chưa có biến môi trường, bỏ qua, làm bước 2.

## 2. Biến môi trường (dịch vụ DevHub → tab Variables)

Bấm **Raw Editor** và dán, sửa các giá trị trong `< >`:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<chuỗi ngẫu nhiên dài, KHÁC giá trị ở máy>
JWT_REFRESH_SECRET=<chuỗi ngẫu nhiên dài khác nữa>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=https://<tên-miền>.up.railway.app
BREVO_API_KEY=<khóa API Brevo>
EMAIL_FROM=<địa chỉ gửi đã xác minh ở Brevo>
VITE_GOOGLE_CLIENT_ID=<Google client ID, bỏ qua nếu không dùng đăng nhập Google>
GEMINI_API_KEY=<nếu dùng tính năng lọc kỹ năng từ CV>
```

Lưu ý quan trọng:
- **KHÔNG đặt `VITE_API_URL`** (để trống). Giao diện và API cùng một địa chỉ nên giao diện tự gọi `/api`.
- Tạo chuỗi ngẫu nhiên: chạy `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` ở máy.
- `${{Postgres.DATABASE_URL}}` là cú pháp tham chiếu của Railway, giữ nguyên cả dấu ngoặc. Nếu dịch vụ cơ sở dữ liệu của bạn đặt tên khác "Postgres" thì đổi tên cho khớp.
- Nếu muốn tạm tắt email: `EMAIL_DISABLED=true` (người dùng mới sẽ không nhận được thư xác thực).

## 3. Ổ lưu trữ cho file tải lên (Volume)

Ổ đĩa của Railway là tạm: CV, ảnh đại diện, file nộp task sẽ **mất sau mỗi lần deploy** nếu không có Volume.

1. Dịch vụ DevHub → **Settings → Volumes → New Volume** (hoặc chuột phải vào dịch vụ → Attach Volume).
2. **Mount path: `/app/server/uploads`**. (Nếu thấy ảnh không giữ lại sau deploy, mở **Deployments → View logs** xem dòng "Đã chép ... tệp mẫu" hoặc kiểm tra lại đường dẫn gắn.)
3. Lần khởi động đầu, máy chủ tự chép ảnh mẫu/logo từ bản chụp lúc build vào volume.

## 4. Mở địa chỉ công khai

Dịch vụ DevHub → **Settings → Networking → Generate Domain**. Chọn vùng máy chủ gần Việt Nam ở **Settings → Deploy → Region** (Southeast Asia, Singapore). Sau đó quay lại bước 2 điền `CLIENT_URL` đúng địa chỉ này và bước 0.2 cho Google.

## 5. Nạp dữ liệu từ máy bạn vào cơ sở dữ liệu Railway

Cơ sở dữ liệu mới trống. Máy chủ tự thêm một số cột còn thiếu khi khởi động, nhưng dữ liệu và bảng phải nạp từ file `server/database_dump.sql`.

1. Railway → **Postgres → Connect → Public Network**, chép Host, Port, Database, User, Password (địa chỉ công khai kiểu `xxx.proxy.rlwy.net`).
2. Ở máy, trong thư mục `server`, chạy (PowerShell), thay bằng giá trị thật. Dùng `db:import:remote` (gửi cả file dump một lượt, chỉ vài giây). Đừng dùng `db:import` cho cơ sở dữ liệu ở xa: nó gửi từng câu INSERT qua psql nên mất cả chục phút:

```powershell
$env:DB_HOST="xxx.proxy.rlwy.net"; $env:DB_PORT="12345"; $env:DB_USER="postgres"; $env:DB_PASSWORD="..."; $env:DB_NAME="railway"
npm run db:import:remote
```

3. Khởi động lại dịch vụ DevHub (Deployments → Redeploy) rồi mở địa chỉ công khai kiểm tra.

> Cẩn thận: lệnh này **xóa và tạo lại bảng** của cơ sở dữ liệu mà các biến `DB_*` trỏ tới. Chỉ chạy khi chắc chắn trỏ đúng vào Postgres của Railway, và đóng cửa sổ PowerShell sau đó để không chạy nhầm vào cơ sở dữ liệu ở máy.

## 6. Việc bắt buộc sau khi deploy (bảo mật)

Dữ liệu mẫu có các tài khoản và mật khẩu đã ghi trong repo (ví dụ `admin@devhub.vn / Admin@123456`). Nếu repo công khai thì **ai cũng đăng nhập được quyền Admin** trên trang của bạn.
- Đăng nhập admin, **đổi mật khẩu ngay**; đổi hoặc khóa các tài khoản mẫu bạn không cần.
- Hoặc để repo ở chế độ riêng tư.

## 7. Dùng hằng ngày

- Push code lên nhánh đã chọn là Railway tự build và deploy lại (khoảng 2–4 phút).
- Xem lỗi: dịch vụ → **Deployments → View logs**.
- Xem chi phí: **Usage** ở thanh bên. Nên đặt cảnh báo/giới hạn chi tiêu trong phần này.
- Khi nâng schema cơ sở dữ liệu (thêm bảng/cột mới), chạy lại mục 5 hoặc chạy script migrate tương ứng trỏ vào cơ sở dữ liệu Railway.
- Sau bảo vệ muốn dừng tính tiền: xóa dịch vụ và Postgres, hoặc hạ xuống gói Free.

## Xử lý sự cố nhanh

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Build báo lỗi `vite: not found` | Biến `NODE_ENV=production` làm bỏ qua thư viện phát triển. Lệnh build đã dùng `--include=dev` nên ít gặp; nếu vẫn lỗi, kiểm tra `package.json` thư mục gốc có đúng bản mới nhất. |
| Trang trắng, F12 báo lỗi `Unsupported protocol` | Đã lỡ đặt `VITE_API_URL`. Xóa biến này rồi deploy lại. |
| Không đăng nhập được / bị đá ra | `CLIENT_URL` chưa đúng địa chỉ công khai hoặc truy cập bằng địa chỉ khác (cookie chỉ gắn với một tên miền). |
| Ảnh, CV biến mất sau khi deploy | Chưa gắn Volume hoặc sai Mount path (phải là `/app/server/uploads`). |
| Không nhận được email | Kiểm tra `BREVO_API_KEY`, `EMAIL_FROM` đã xác minh ở Brevo, xem log dòng `[Mailer]`. |
| Đăng nhập Google lỗi "origin is not allowed" | Chưa thêm địa chỉ Railway vào Authorized JavaScript origins. |
| Healthcheck thất bại | Xem log: thường do `DATABASE_URL` sai nên không kết nối được cơ sở dữ liệu. |
