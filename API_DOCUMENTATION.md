# 🚀 Enghub API Documentation

Tài liệu này cung cấp chi tiết các endpoint liên quan đến xác thực (Auth) và người dùng (User) để hỗ trợ việc tích hợp Frontend.

## 📦 Định dạng phản hồi chung (ApiResponse)
Tất cả các API đều trả về cấu trúc JSON sau:
```json
{
  "code": 1000, // 1000 là thành công, các mã khác là lỗi
  "message": "success",
  "result": { ... dữ liệu thực tế ... }
}
```

---

## 🔐 Authentication Endpoints

### 1. Đăng nhập (Login)
Lấy JWT Token để truy cập các tài nguyên bị giới hạn.
- **URL:** `/enghub/auth/token`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "admin@gmail.com",
    "password": "admin"
  }
  ```
- **Response Result:**
  ```json
  {
    "token": "string",
    "authenticated": true
  }
  ```

### 2. Kiểm tra Token (Introspect)
Kiểm tra tính hợp lệ của Token.
- **URL:** `/enghub/auth/introspect`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "token": "string"
  }
  ```

### 3. Lấy thông tin cá nhân (My Info)
- **URL:** `/enghub/auth/myInfo`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response Result:** Trả về chi tiết thông tin người dùng đang đăng nhập.

---

## 👤 User Endpoints

### 1. Đăng ký tài khoản (Register)
- **URL:** `/enghub/users`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@gmail.com",
    "password": "password123",
    "fullName": "Nguyen Van A", // Không bắt buộc
    "phone": "0912345678",       // Không bắt buộc
    "avatarUrl": "url_link"      // Không bắt buộc
  }
  ```

### 2. Cập nhật thông tin người dùng
- **URL:** `/enghub/users/{userId}`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "password": "new_password",
    "fullName": "Updated Name",
    "phone": "0987654321",
    "avatarUrl": "new_url",
    "roles": ["STUDENT"] // Danh sách tên các Role
  }
  ```

### 3. Danh sách người dùng (Chỉ dành cho ADMIN)
- **URL:** `/enghub/users`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`

---

## ⚠️ Các mã lỗi thường gặp (Error Codes)
| Code | Message | Description |
| :--- | :--- | :--- |
| 1000 | success | Thao tác thành công |
| 1002 | User existed | Email đã được đăng ký |
| 1003 | Email is invalid | Định dạng email không đúng |
| 1004 | Password must be at least 8 characters | Mật khẩu quá ngắn |
| 1005 | User not existed | Không tìm thấy người dùng |
| 1006 | Unauthenticated | Sai mật khẩu hoặc Token hết hạn |
| 1007 | You do not have permission | Không có quyền truy cập |
| 1008 | Email is required | Email không được để trống |
| 9999 | Uncategorized error | Lỗi hệ thống chưa xác định |
