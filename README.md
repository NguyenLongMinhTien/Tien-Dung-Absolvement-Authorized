# User Auth & Logging Service (Node.js + Express + MongoDB) — Demo

Module "Người dùng & Xác thực" cho dự án backup/restore: đăng ký, đăng nhập, cập nhật hồ sơ, JWT auth, RBAC (user/admin), system logs và restore request logging.

## Tính năng
- Register (bcrypt)
- Login (JWT)
- Middleware bảo vệ route: protect (JWT) và authorize (role)
- User endpoints: lấy và cập nhật hồ sơ
- Admin endpoint: liệt kê người dùng
- Restore request: tạo entry trong `restore_logs` (trạng thái `pending`)
- System logging: mọi thao tác quan trọng được ghi vào `system_logs`

## Công nghệ
- Node.js, Express
- MongoDB, Mongoose
- bcrypt, jsonwebtoken
- dotenv
- (Tùy chọn) morgan, helmet, rate-limit

## Mô hình dữ liệu (Collections)
- users
  - _id: ObjectId
  - email: string (unique)
  - password: string (hashed)
  - role: "user" | "admin"
  - profile: { fullName, phone, address }
  - lastLoginAt: Date
  - createdAt: Date
- system_logs
  - _id
  - user: ObjectId | null
  - action: string (USER_REGISTER | USER_LOGIN | USER_UPDATE_PROFILE | REQUEST_RESTORE | ...)
  - meta: Object
  - ip: string
  - createdAt: Date
- restore_logs
  - _id
  - user: ObjectId (owner of data)
  - requestedBy: ObjectId (who requested)
  - status: pending | in_progress | completed | failed
  - backupRef: string (tùy chọn)
  - notes: string
  - createdAt, completedAt

Quan hệ: `system_logs` và `restore_logs` tham chiếu `users` bằng ObjectId.

## Cách chạy
Yêu cầu: Node.js >= 18, MongoDB URI hợp lệ.

1) Tạo file môi trường
- Copy `.env.example` -> `.env` (hoặc tạo nhanh như dưới)

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret
PORT=3000
```

2) Cài đặt và chạy
- npm install
- npm run dev

Ứng dụng khởi động tại http://localhost:3000 (hoặc PORT bạn đặt).

## Middleware
- protect: đọc header Authorization "Bearer <token>", verify JWT, nạp `req.user`. Trả 401 nếu không hợp lệ.
- authorize(...roles): kiểm tra `req.user.role` có thuộc roles. Trả 403 nếu không có quyền.

Ví dụ header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints
- Auth
  - POST /api/v1/auth/register
    - body: { email, password, profile? }
  - POST /api/v1/auth/login
    - body: { email, password }
    - returns: { token, user }

- Users
  - GET /api/v1/users/me
    - headers: Authorization: Bearer <token>
  - PATCH /api/v1/users/me
    - body: { profile?, password?, email? }
  - GET /api/v1/users
    - admin only (Authorization: Bearer)

- Restore
  - POST /api/v1/users/:id/request-restore
    - headers: Authorization: Bearer
    - body: { notes?, backupRef? }
    - user có thể yêu cầu cho chính mình; admin có thể yêu cầu thay user khác.

## Dòng chảy Postman (tóm tắt)
1) Register -> 2) Login -> lấy token
3) GET /api/v1/users/me (kèm Authorization)
4) PATCH /api/v1/users/me để cập nhật profile
5) POST /api/v1/users/:id/request-restore (id = của mình; hoặc admin có thể dùng id khác)
6) Admin dùng GET /api/v1/users để xem danh sách

## Logging
- Mỗi sự kiện chính (đăng ký, đăng nhập, cập nhật hồ sơ, yêu cầu restore) sinh một bản ghi trong `system_logs`:
  - action, user (ObjectId | null), meta (payload tóm tắt), ip, createdAt
- Mỗi yêu cầu restore tạo một `restore_logs` với:
  - user, requestedBy, status=pending, notes/backupRef, timestamps

## Bảo mật & Triển khai
- Không commit MONGO_URI / JWT_SECRET vào public repo.
- Dùng HTTPS (TLS) khi triển khai.
- Khuyến nghị bật rate-limiting, helmet, CORS, và log retention.
- Xoá logs nhạy cảm định kỳ, phân quyền rõ ràng (RBAC).

## Mở rộng
- Thêm collection `backups` + cron snapshot -> lưu metadata.
- Admin endpoint để review/approve/execute restore (kết nối module backup/restore).
- Metrics: số restore, thời gian backup, tỉ lệ lỗi.
- Thêm email/OTP, refresh token, và revoke token cho bảo mật cao hơn.

## Ghi chú
- Đây là demo theo dạng "Tiến Dũng Absolvement - Authorized".
- Endpoint/Schema có thể khác đôi chút so với triển khai thực tế; chỉnh sửa theo nhu cầu dự án.
