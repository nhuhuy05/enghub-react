# EngHub Frontend API Guide

Tài liệu này dành cho frontend khi tích hợp với backend EngHub.

## 1) Base URL

- Local: `http://localhost:8080/enghub`

## 2) Chuẩn request/response

### Headers

- `Content-Type: application/json`
- `Authorization: Bearer <access_token>` cho endpoint cần đăng nhập.

### Response bọc chuẩn

```json
{
  "code": 1000,
  "message": "optional",
  "result": {}
}
```

- `code = 1000`: thành công.
- Lỗi nghiệp vụ sẽ có `code/message` theo backend.

## 3) Auth flow cho frontend

1. User login qua `POST /auth/token`.
2. Lưu token (memory hoặc storage theo chính sách app).
3. Gắn token vào `Authorization` cho các API protected.
4. Nếu nhận `401` (`UNAUTHENTICATED`), điều hướng về màn hình login.
5. Nếu nhận `403` (`UNAUTHORIZED`), hiển thị lỗi không đủ quyền.

## 4) Endpoints

## 4.1 Authentication

### POST `/auth/token`

Đăng nhập, trả JWT.

Request:

```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

Response:

```json
{
  "code": 1000,
  "result": {
    "token": "<jwt>",
    "authenticated": true
  }
}
```

### POST `/auth/introspect`

Kiểm tra token còn valid.

Request:

```json
{
  "token": "<jwt>"
}
```

Response:

```json
{
  "code": 1000,
  "result": {
    "valid": true
  }
}
```

## 4.2 Users

### POST `/users` (public)

Tạo user mới.

Request:

```json
{
  "email": "user1@gmail.com",
  "password": "12345678",
  "fullName": "User One",
  "phone": "0123456789",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

Response:

```json
{
  "code": 1000,
  "result": {
    "id": "uuid",
    "email": "user1@gmail.com",
    "fullName": "User One",
    "phone": "0123456789",
    "avatarUrl": "https://example.com/avatar.jpg",
    "roles": []
  }
}
```

### GET `/users` (ADMIN)

Lấy danh sách user. Cần token có role admin.

Response:

```json
{
  "code": 1000,
  "result": [
    {
      "id": "uuid",
      "email": "user1@gmail.com",
      "fullName": "User One",
      "phone": "0123456789",
      "avatarUrl": "https://example.com/avatar.jpg",
      "roles": []
    }
  ]
}
```

### GET `/users/{userId}`

Lấy user theo id. Backend đang check hậu kiểm: chỉ cho phép nếu `result.email == email trong token`.

### GET `/users/myInfo`

Lấy thông tin user hiện tại theo token.

### PUT `/users/{userId}`

Cập nhật user.

Request:

```json
{
  "password": "newpassword123",
  "fullName": "Updated Name",
  "phone": "0987654321",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "roles": ["ADMIN", "TEACHER"]
}
```

### DELETE `/users/{userId}`

Xóa user.

Response:

```json
{
  "code": 1000,
  "result": "User has been deleted"
}
```

## 4.3 Roles

### POST `/roles`

Tạo role.

Request:

```json
{
  "name": "TEACHER",
  "description": "Teacher role",
  "permissions": ["LESSON_READ", "LESSON_WRITE"]
}
```

### GET `/roles`

Lấy danh sách role.

### DELETE `/roles/{role}`

Xóa role theo tên.

## 4.4 Permissions

### POST `/permissions`

Tạo permission.

Request:

```json
{
  "name": "LESSON_READ",
  "description": "Read lesson data"
}
```

### GET `/permissions`

Lấy danh sách permission.

### DELETE `/permissions/{permission}`

Xóa permission theo tên.

## 5) Error codes quan trọng

- `1002` - `USER_EXISTED`
- `1003` - `INVALID_EMAIL`
- `1004` - `INVALID_PASSWORD` (>= 8 ký tự)
- `1005` - `USER_NOT_EXISTED`
- `1006` - `UNAUTHENTICATED` (thường HTTP 401)
- `1007` - `UNAUTHORIZED` (HTTP 403)

Ví dụ lỗi:

```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

## 6) Ví dụ gọi API từ frontend (fetch)

```ts
const BASE_URL = "http://localhost:8080/enghub";

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMyInfo(token: string) {
  const res = await fetch(`${BASE_URL}/users/myInfo`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
```

## 7) Lưu ý tích hợp thực tế

- Endpoint `/auth/logout` đang được khai báo public trong security config nhưng chưa có controller tương ứng.
- Hiện tại CORS mặc định cho phép `http://localhost:5173`.
- Nên xử lý tập trung `401/403` trong HTTP client interceptor.
