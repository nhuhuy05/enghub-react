# EngHub API Endpoints

Base URL (local):

`http://localhost:8080/enghub`

All responses are wrapped by:

```json
{
  "code": 1000,
  "message": "optional",
  "result": {}
}
```

## Authentication (for FE)

### FE flow đề xuất

1. User login bằng email/password qua `POST /auth/token`.
2. Lấy `accessToken` từ `result` và lưu (ưu tiên memory hoặc secure storage).
3. Gọi API protected với header:
   - `Authorization: Bearer <accessToken>`
4. Khi app reload hoặc trước action quan trọng, có thể validate token bằng `POST /auth/introspect`.
5. Nếu API trả lỗi unauthorized/forbidden, FE clear session và điều hướng về màn login.

### 1) Login

- Method: `POST`
- Path: `/auth/token`
- Auth: Public
- Content-Type: `application/json`

Request body:

```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

Response (example):

```json
{
  "code": 1000,
  "message": "success",
  "result": {
    "accessToken": "<jwt-token>",
    "authenticated": true
  }
}
```

### 2) Introspect token

- Method: `POST`
- Path: `/auth/introspect`
- Auth: Public
- Content-Type: `application/json`

Request body:

```json
{
  "token": "<jwt-token>"
}
```

Response (example):

```json
{
  "code": 1000,
  "message": "success",
  "result": {
    "valid": true
  }
}
```

## Users (for FE)

### User object FE thường dùng

```json
{
  "id": "uuid",
  "email": "student1@gmail.com",
  "fullName": "Student 1",
  "phone": "0900000000",
  "avatarUrl": "https://example.com/avatar.png",
  "roles": ["STUDENT"]
}
```

### 3) Create user (register)

- Method: `POST`
- Path: `/users`
- Auth: Public
- Content-Type: `application/json`

Request body:

```json
{
  "email": "student1@gmail.com",
  "password": "123456",
  "fullName": "Student 1",
  "phone": "0900000000",
  "avatarUrl": "https://example.com/avatar.png"
}
```

### 4) Get all users (admin)

- Method: `GET`
- Path: `/users`
- Auth: Bearer JWT
- Authorization: `hasRole('ADMIN')`

Headers:

```http
Authorization: Bearer <jwt-token>
```

### 5) Get user by ID

- Method: `GET`
- Path: `/users/{userId}`
- Auth: Bearer JWT
- Authorization: chỉ user sở hữu data đó (email của user trả về phải trùng với `authentication.name`)

Headers:

```http
Authorization: Bearer <jwt-token>
```

### 6) Get my info

- Method: `GET`
- Path: `/users/myInfo`
- Auth: Bearer JWT

Headers:

```http
Authorization: Bearer <jwt-token>
```

### 7) Update user

- Method: `PUT`
- Path: `/users/{userId}`
- Auth: Bearer JWT
- Content-Type: `application/json`

Headers:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "password": "new-password",
  "fullName": "New Name",
  "phone": "0911111111",
  "avatarUrl": "https://example.com/new-avatar.png",
  "roles": ["STUDENT", "TEACHER"]
}
```

### 8) Delete user

- Method: `DELETE`
- Path: `/users/{userId}`
- Auth: Bearer JWT

Headers:

```http
Authorization: Bearer <jwt-token>
```

## Roles

### 9) Create role

- Method: `POST`
- Path: `/roles`
- Auth: Bearer JWT

Request body:

```json
{
  "name": "CONTENT_REVIEWER",
  "description": "Can review content",
  "permissions": ["question.read", "question.update"]
}
```

### 10) Get all roles

- Method: `GET`
- Path: `/roles`
- Auth: Bearer JWT

### 11) Delete role

- Method: `DELETE`
- Path: `/roles/{role}`
- Auth: Bearer JWT
- Note: `{role}` is role name (business key), for example `STUDENT`.

## Permissions

### 12) Create permission

- Method: `POST`
- Path: `/permissions`
- Auth: Bearer JWT

Request body:

```json
{
  "name": "question.create",
  "description": "Create TOEIC questions"
}
```

### 13) Get all permissions

- Method: `GET`
- Path: `/permissions`
- Auth: Bearer JWT

### 14) Delete permission

- Method: `DELETE`
- Path: `/permissions/{permission}`
- Auth: Bearer JWT
- Note: `{permission}` is permission name (business key), for example `question.create`.

## Security Summary

Public endpoints (`POST` only):

- `/users`
- `/auth/token`
- `/auth/introspect`
- `/auth/logout` (present in security config)

All other endpoints require Bearer JWT.
