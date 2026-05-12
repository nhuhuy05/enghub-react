# EngHub React

Frontend cho EngHub, một ứng dụng luyện tiếng Anh/TOEIC với các khu vực học từ vựng, ngữ pháp, nghe, đọc, đề thi và hồ sơ người dùng.

## Công nghệ

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Zustand
- Lucide React
- Framer Motion

## Yêu cầu môi trường

- Node.js phiên bản mới, khuyến nghị Node 20+
- npm
- Backend EngHub chạy tại `http://localhost:8080/enghub`

Base URL của API đang được cấu hình trong [src/api/apiClient.ts](C:/Code/enghub-react/src/api/apiClient.ts).

## Cài đặt

```bash
npm install
```

Trên Windows PowerShell, nếu gặp lỗi execution policy khi chạy `npm`, có thể dùng:

```bash
npm.cmd install
```

## Chạy dự án

```bash
npm run dev
```

Hoặc trên Windows PowerShell:

```bash
npm.cmd run dev
```

Ứng dụng Vite mặc định chạy ở:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

Hoặc:

```bash
npm.cmd run build
```

Lệnh build sẽ chạy TypeScript trước, sau đó build bằng Vite.

## Kiểm tra lint

```bash
npm run lint
```

## Cấu trúc thư mục

```text
src/
  api/
    apiClient.ts
  components/
    layout/
  features/
    auth/
    dashboard/
    exam/
    grammar/
    listening/
    profile/
    reading/
    vocabulary/
  routes/
    AppRoutes.tsx
  types/
    apiTypes.ts
```

Các feature chính thường được chia theo mẫu:

- `components`: giao diện của feature.
- `hooks`: logic lấy dữ liệu, xử lý form hoặc session.
- `services`: hàm gọi API hoặc mock data.
- `types`: kiểu dữ liệu TypeScript.

## Luồng xác thực

Auth đang dùng Zustand để lưu trạng thái người dùng trong [src/features/auth/store/useAuthStore.ts](C:/Code/enghub-react/src/features/auth/store/useAuthStore.ts).

Luồng chính:

1. Đăng nhập qua `POST /auth/token`.
2. Lưu JWT vào `localStorage`.
3. Gọi `GET /users/myInfo` để lấy thông tin người dùng.
4. Axios interceptor tự gắn `Authorization: Bearer <token>`.
5. Khi API trả `401`, app xóa session và chuyển về `/login`.

## API

Tài liệu API frontend nằm ở [FRONTEND_API.md](C:/Code/enghub-react/FRONTEND_API.md).

Các endpoint đang được dùng trực tiếp:

- `POST /auth/token`
- `POST /auth/introspect`
- `POST /auth/logout`
- `POST /users`
- `GET /users/myInfo`
- `PUT /users/{userId}`

## Profile

Feature profile nằm trong [src/features/profile](C:/Code/enghub-react/src/features/profile).

Các file chính:

- [profileService.ts](C:/Code/enghub-react/src/features/profile/services/profileService.ts): gọi API profile.
- [useProfile.ts](C:/Code/enghub-react/src/features/profile/hooks/useProfile.ts): quản lý state tải/sửa hồ sơ.
- [ProfilePage.tsx](C:/Code/enghub-react/src/features/profile/components/ProfilePage.tsx): giao diện hồ sơ.
- [index.ts](C:/Code/enghub-react/src/features/profile/types/index.ts): type request update profile.

Thông tin có thể cập nhật:

- Họ tên
- Số điện thoại
- Ảnh đại diện
- Mật khẩu mới

## Trạng thái dữ liệu

Một số module đã gọi backend thật:

- `auth`
- `profile`

Một số module vẫn đang dùng mock data:

- `vocabulary`
- `grammar`
- `exam`

## Ghi chú phát triển

- Alias `@/*` trỏ tới `src/*`, cấu hình trong [tsconfig.app.json](C:/Code/enghub-react/tsconfig.app.json).
- API client hiện hard-code base URL `http://localhost:8080/enghub`.
- Nếu build fail vì `noUnusedLocals`, cần xóa các import/type không dùng trong source.
- Nếu tiếng Việt hiển thị sai dạng `ThÃ´ng tin`, cần kiểm tra lại encoding file và terminal/editor, ưu tiên lưu file ở UTF-8.
