# EngHub React

EngHub React là frontend cho nền tảng học tiếng Anh và luyện TOEIC EngHub. Ứng dụng tập trung vào trải nghiệm học của học viên, công cụ biên soạn nội dung cho giáo viên và khu quản trị hệ thống cho admin.

## Nội Dung Chính

- Học viên: trang chủ, hồ sơ cá nhân, từ vựng, nghe chép chính tả, đọc song ngữ, danh sách đề thi, làm bài, lịch sử làm bài và kết quả.
- Giáo viên: quản lý đề thi, tạo đề theo luồng nhiều bước, upload media, rà soát question group, publish/unpublish đề, quản lý nội dung nghe, đọc và từ vựng.
- Admin: quản lý người dùng, vai trò, đề thi, nội dung nghe, đọc và từ vựng.
- Xác thực: JWT lưu trong `localStorage`, Zustand quản lý session, axios interceptor tự gắn Bearer token và xử lý lỗi `401/403`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Zustand
- Lucide React
- Framer Motion
- WaveSurfer.js
- ESLint

## Yêu Cầu Môi Trường

- Node.js 20+ khuyến nghị
- npm
- Backend EngHub đang chạy, mặc định tại:

```text
http://localhost:8080/enghub
```

Frontend đọc base URL từ biến môi trường `VITE_API_BASE_URL`. Nếu không cấu hình, app dùng fallback `http://localhost:8080/enghub` trong [src/api/apiClient.ts](c:/Code/enghub/enghub-react/src/api/apiClient.ts).

Tạo file `.env.local` nếu cần đổi backend:

```env
VITE_API_BASE_URL=http://localhost:8080/enghub
```

## Cài Đặt

```bash
npm install
```

Trên Windows PowerShell, nếu gặp lỗi execution policy với `npm`, dùng:

```powershell
npm.cmd install
```

## Chạy Development

```bash
npm run dev
```

Hoặc trên Windows PowerShell:

```powershell
npm.cmd run dev
```

Vite mặc định mở ứng dụng tại:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

- `dev`: chạy Vite dev server.
- `build`: chạy `tsc -b` trước, sau đó build production bằng Vite.
- `lint`: kiểm tra ESLint toàn project.
- `preview`: preview bản build production.

## Cấu Trúc Dự Án

```text
src/
  api/
    apiClient.ts
  assets/
    images/
  components/
    brand/
    layout/
    ui/
  features-admin/
    dashboard/
    roles/
    users/
  features-teacher/
    assignments/
    classes/
    dashboard/
    listening/
    reading/
    tests/
  features-user/
    auth/
    home/
    listening/
    profile/
    reading/
    test-attempt/
    vocabulary/
  routes/
    AppRoutes.tsx
    ProtectedRoute.tsx
    RoleRoute.tsx
    RootRedirect.tsx
  types/
    apiTypes.ts
```

Quy ước trong mỗi feature:

- `components`: UI và page components.
- `hooks`: stateful logic, session logic hoặc controller logic.
- `services`: API client methods và mapping dữ liệu.
- `types`: TypeScript types của feature.
- `utils`, `constants`, `data`: helper, nhãn hiển thị hoặc dữ liệu cục bộ khi feature cần.

Alias `@/*` trỏ tới `src/*`, cấu hình trong [vite.config.ts](c:/Code/enghub/enghub-react/vite.config.ts) và [tsconfig.app.json](c:/Code/enghub/enghub-react/tsconfig.app.json).

## Routing Và Phân Quyền

Routing chính nằm trong [src/routes/AppRoutes.tsx](c:/Code/enghub/enghub-react/src/routes/AppRoutes.tsx).

### Public

- `/`: hiển thị trang chủ nếu chưa đăng nhập, hoặc redirect theo role nếu đã đăng nhập.
- `/login`: đăng nhập.
- `/register`: đăng ký.
- `/tests`: danh sách đề thi public trong layout học viên.

### Protected Chung

- `/profile`: hồ sơ cá nhân.

### Student

- `/dashboard`
- `/vocabulary`
- `/vocabulary/review`
- `/vocabulary/topics/:topicId`
- `/attempts`
- `/attempts/:attemptId`
- `/attempts/:attemptId/result`
- `/listening`
- `/listening/:testId/:partId`
- `/reading`
- `/reading/:lessonId`

### Teacher

- `/teacher/tests`
- `/teacher/tests/create`
- `/teacher/listening`
- `/teacher/reading`
- `/teacher/vocabulary`
- `/teacher/vocabulary/topics/:topicId`
- `/teacher/dashboard`
- `/teacher/classes`
- `/teacher/assignments`

### Admin

- `/admin/users`
- `/admin/tests`
- `/admin/tests/create`
- `/admin/listening`
- `/admin/reading`
- `/admin/vocabulary`
- `/admin/vocabulary/topics/:topicId`

Role mặc định được xử lý trong [src/features-user/auth/utils/roleUtils.ts](c:/Code/enghub/enghub-react/src/features-user/auth/utils/roleUtils.ts):

- `ADMIN` -> `/admin/users`
- `TEACHER` -> `/teacher/tests`
- `STUDENT` -> `/dashboard`

## Luồng Xác Thực

Auth được triển khai qua:

- [src/features-user/auth/services/authService.ts](c:/Code/enghub/enghub-react/src/features-user/auth/services/authService.ts)
- [src/features-user/auth/hooks/useAuth.ts](c:/Code/enghub/enghub-react/src/features-user/auth/hooks/useAuth.ts)
- [src/features-user/auth/store/useAuthStore.ts](c:/Code/enghub/enghub-react/src/features-user/auth/store/useAuthStore.ts)
- [src/api/apiClient.ts](c:/Code/enghub/enghub-react/src/api/apiClient.ts)

Luồng chính:

1. Đăng nhập qua `POST /auth/token`.
2. Lưu JWT vào `localStorage`.
3. Gọi `GET /users/myInfo` để lấy thông tin user.
4. Khi app khởi động lại, `App.tsx` gọi `initializeAuth()`.
5. `initializeAuth()` introspect token bằng `POST /auth/introspect`, sau đó load lại user.
6. Axios interceptor tự gắn `Authorization: Bearer <token>` cho request.
7. Khi backend trả `401` hoặc `403`, app xóa session local và chuyển về `/login`.

## API Và Tài Liệu FE-BE

API response chung dùng shape:

```ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}
```

Type dùng chung nằm ở [src/types/apiTypes.ts](c:/Code/enghub/enghub-react/src/types/apiTypes.ts).

Tài liệu contract theo feature:

- [Admin User Management](c:/Code/enghub/enghub-react/docs/admin-user-management-fe-guide.md)
- [Listening Dictation](c:/Code/enghub/enghub-react/docs/listening-dictation-fe-guide.md)
- [Reading Bilingual Practice](c:/Code/enghub/enghub-react/docs/reading-bilingual-fe-guide.md)
- [Practice Question AI Chat Streaming](c:/Code/enghub/enghub-react/docs/practice-question-chat-fe-guide.md)

Các nhóm endpoint đang được frontend gọi:

- Auth/profile: `/auth/token`, `/auth/introspect`, `/auth/logout`, `/users`, `/users/myInfo`, `/users/{userId}`.
- Student tests/attempts: `/test-collections`, `/tests`, `/attempts`, `/attempts/{attemptId}/content`, `/attempts/{attemptId}/answers`, `/attempts/{attemptId}/submit`, `/attempts/{attemptId}/result`.
- Vocabulary: `/vocabulary/*`, `/admin/vocabulary/*`.
- Reading: `/reading-lessons/*`, `/admin/reading-lessons/*`.
- Listening dictation: `/listening/tests/{testId}/parts/{partNumber}/dictation`.
- Teacher/admin tests: `/admin/test-collections`, `/admin/tests`, `/admin/question-groups`, `/admin/tests/{testId}/media`, preview và publish endpoints.
- Admin users: `/admin/users`, `/roles`.

## Feature Overview

### Student

- `features-user/home`: dashboard và top navigation.
- `features-user/auth`: đăng nhập, đăng ký, restore session, logout.
- `features-user/profile`: xem và cập nhật hồ sơ.
- `features-user/vocabulary`: danh sách chủ đề, chi tiết từ, học từ và ôn tập.
- `features-user/listening`: danh sách bài nghe và màn hình nghe chép chính tả.
- `features-user/reading`: danh sách bài đọc song ngữ và màn hình luyện đọc.
- `features-user/test-attempt`: catalog đề, tạo attempt, làm bài, audio range player, bảng câu hỏi, nộp bài, kết quả, lịch sử và chat AI theo câu hỏi trong practice mode.

### Teacher

- `features-teacher/tests`: danh sách đề, tạo đề, import câu hỏi, upload media, review groups, preview, publish/unpublish.
- `features-teacher/listening`: quản lý transcript lines cho listening dictation.
- `features-teacher/reading`: quản lý reading lessons từ TOEIC Part 7, hỗ trợ AI translation/vocabulary.
- `features-teacher/classes` và `features-teacher/assignments`: khung giao diện cho lớp học và bài giao.
- `features-teacher/dashboard`: dashboard giáo viên.

### Admin

- `features-admin/users`: danh sách user, lọc, phân trang, tạo/sửa/xóa, bật tắt trạng thái và gán role.
- `features-admin/roles`: entry quản lý role hiện redirect về user management theo route hiện tại.
- Admin cũng dùng lại các module tests, listening, reading và vocabulary ở khu teacher/admin.

## Ghi Chú Phát Triển

- Không commit `dist/`, `node_modules/` hoặc file build cache.
- Nếu build fail vì TypeScript unused checks, xóa import/type/variable không dùng trước khi build lại.
- Giữ service layer chịu trách nhiệm mapping snake_case từ backend sang camelCase nếu UI đang dùng camelCase.
- Với streaming SSE của AI chat, dùng `fetch()` và `ReadableStream`; không dùng `EventSource` vì endpoint cần `POST` và Bearer token.
- Với audio theo đoạn, ưu tiên dùng `start_ms` và `end_ms` từ backend để phát đúng segment.

## Kiểm Tra Trước Khi Gửi Code

```bash
npm run lint
npm run build
```

Nếu chỉ thay đổi tài liệu, không bắt buộc build lại, nhưng nên đảm bảo README vẫn phản ánh đúng scripts, routes và API client hiện tại.
