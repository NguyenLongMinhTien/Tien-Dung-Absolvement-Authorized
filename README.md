# Club Management API (Node.js + Express + MongoDB)

Backend quản lý câu lạc bộ học sinh: Auth, Users, Clubs, Memberships, Wishlist, Notifications, RBAC, Validation, Rate Limiting, và Analytics.

## Tính năng
- Auth: Register (bcrypt), Login (JWT), refresh hồ sơ cơ bản
- Users: me (GET/PUT), admin CRUD users, analytics users theo role (`GET /api/v1/users/stats`)
- Clubs: tạo/sửa/xóa/xem (admin)
- Memberships: apply/approve/reject/leave/setRole, analytics memberships theo status/role (`GET /api/v1/memberships/stats`)
- Wishlist: thêm/xóa/xem (tham chiếu User -> Wishlist)
- Notifications: tạo/xem (tham chiếu User -> Notification)
- RBAC: roles `student`, `admin` với middleware `protect`, `authorize`
- Validation: `express-validator` cho các API quan trọng
- Rate Limiting: toàn cục 100 requests/15 phút (`index.js`)
- Versioning: tiền tố `/api/v1`

## Công nghệ
- Node.js, Express
- MongoDB Atlas, Mongoose
- bcryptjs, jsonwebtoken
- express-rate-limit, express-validator, dotenv

## Mô hình dữ liệu
- User (Embedding + Referencing)
  - profile (nhúng): `{ grade, phone, address: { street, city, district } }`
  - liên kết: Memberships, Wishlist, Notifications (ObjectId tham chiếu)
- Club: `{ name, description, createdBy: ref(User) }`
- Membership: `{ user: ref(User), club: ref(Club), role, status, joinedAt }`
- Wishlist: `{ user: ref(User), items: [ObjectId hoặc thông tin] }`
- Notification: `{ user: ref(User), title, message }`

## Endpoints chính
- Auth
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
- Users
  - GET /api/v1/users/me
  - PUT /api/v1/users/me
  - GET /api/v1/users (admin)
  - GET /api/v1/users/:id (admin)
  - PUT /api/v1/users/:id (admin)
  - DELETE /api/v1/users/:id (admin)
  - GET /api/v1/users/stats (admin) — Aggregation
- Clubs (admin)
  - CRUD tại /api/v1/clubs
- Memberships
  - POST /api/v1/memberships/apply
  - GET /api/v1/memberships/me
  - DELETE /api/v1/memberships/:id
  - GET /api/v1/memberships/club/:clubId (admin hoặc leader)
  - PATCH /api/v1/memberships/:id/approve (admin hoặc leader)
  - PATCH /api/v1/memberships/:id/reject (admin hoặc leader)
  - PATCH /api/v1/memberships/:id/role (admin hoặc leader)
  - GET /api/v1/memberships/stats (admin) — Aggregation
- Wishlist
  - tại /api/v1/wishlist
- Notifications
  - tại /api/v1/notifications

## Chạy dự án
```
MONGO_URI=...
JWT_SECRET=...
PORT=3000
```
- npm install
- npm run dev
- Truy cập http://localhost:3000

## Bảo mật và lưu ý
- JWT qua header `Authorization: Bearer <token>`
- Không commit `.env` (đã có `.gitignore`)
- Rate limiting đã bật; cân nhắc tách limiter riêng cho login nếu cần

## Demo Postman gợi ý
1) Register -> Login -> lấy token
2) CRUD Users (admin) và endpoints me
3) Tạo Club (admin), apply membership (student), approve (leader/admin)
4) Gọi analytics: `/api/v1/users/stats`, `/api/v1/memberships/stats`
