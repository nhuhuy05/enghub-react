---
trigger: always_on
---

# 📜 BỘ QUY TẮC PHÁT TRIỂN DỰ ÁN TOEIC (DÀNH CHO ANTIGRAVITY)

> **Lưu ý cho Antigravity:** Đây là nguồn tài liệu chuẩn duy nhất cho dự án này. Mọi thay đổi code hoặc đề xuất tính năng phải đối chiếu với các quy tắc dưới đây.

---

## 1. PHẢN HỒI & GIAO TIẾP
- **Ngôn ngữ:** Luôn luôn phản hồi và giải thích bằng **Tiếng Việt**.
- **Giải thích:** Trước khi thực hiện thay đổi lớn, phải tóm tắt lý do và phương án thực hiện.

## 2. CẤU TRÚC THƯ MỤC (FEATURE-BASED)
Mọi code liên quan đến nghiệp vụ phải nằm trong `src/features/`. Cấu trúc một feature chuẩn:
- `components/`: Các UI components chỉ dùng riêng cho feature này.
- `hooks/`: Các logic xử lý (State, Effects) được tách ra.
- `services/`: Các hàm gọi API (Axios/TanStack Query).
- `types/`: Định nghĩa kiểu dữ liệu TypeScript.
- `utils/`: Các hàm bổ trợ riêng cho feature (ví dụ: công thức tính điểm).

## 3. CÔNG NGHỆ CHỦ ĐẠO (TECH STACK)
- **Frontend:** React (Vite) + TypeScript.
- **Styling:** Tailwind CSS.
- **Icons:** Lucide React.
- **State Management:** Zustand (cho Auth, Session làm bài).
## 4. QUY TẮC VIẾT CODE (CODING STANDARDS)
- **Component:** Luôn dùng **Arrow Function** và **Functional Component**.
- **Đặt tên:**
  - File Component: `PascalCase.tsx` (Ví dụ: `ExamResult.tsx`).
  - Thư mục: `kebab-case` (Ví dụ: `listening-practice/`).
  - Hook: `camelCase` bắt đầu bằng `use`.
- **TypeScript:** Tuyệt đối không dùng `any`. Mọi interface phải được định nghĩa rõ ràng.
- **Logic:** Nếu một hàm xử lý trong Component dài quá 15 dòng, phải tách ra Custom Hook.

## 5. TIÊU CHUẨN GIAO DIỆN (UI/UX)
- **Thẩm mỹ:** Giao diện phải mang lại cảm giác **Premium**, hiện đại.
- **Đồng nhất:** Sử dụng bảng màu và spacing đã định nghĩa trong `index.css`.
- **Phản hồi:** Các nút bấm, thẻ bài phải có hiệu ứng `hover` và `active` (Micro-animations).

## 6. QUY TẮC RIÊNG CHO CÁC MODULE TOEIC
- **Module Exam:** Phải xử lý tốt việc lưu trạng thái câu hỏi vào LocalStorage để tránh mất dữ liệu khi F5.
- **Module Listening:** Tối ưu hóa việc load Audio, tránh render lại (re-render) thẻ Audio vô ích.
- **Module Vocabulary (SRS):** Logic tính toán thời gian ôn tập phải được tách riêng vào thư mục `utils` của feature đó.

---
**Antigravity cam kết tuân thủ các quy tắc trên trong mọi yêu cầu tiếp theo.**
