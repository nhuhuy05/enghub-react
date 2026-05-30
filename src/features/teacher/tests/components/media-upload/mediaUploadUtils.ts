export interface UploadItem {
  id: string;
  file: File;
  label: string;
  type: 'image' | 'audio';
  status: 'queued' | 'uploading' | 'uploaded' | 'failed';
  error?: string;
}

export const getFileStem = (filename: string) => filename.replace(/\.[^/.]+$/, '');

export const detectMediaType = (file: File): UploadItem['type'] => {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  return /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name) ? 'audio' : 'image';
};

export const getLabelWarning = (label: string, type: UploadItem['type']) => {
  if (!label.trim()) return 'Label là bắt buộc.';
  if (/\.[a-z0-9]{2,5}$/i.test(label)) return 'Bỏ phần mở rộng file khỏi label.';
  if (/\s+\(\d+\)$/.test(label)) return 'Bỏ khoảng trắng trước hậu tố ảnh, ví dụ 176-180(1).';
  if (/\s/.test(label)) return 'Label có khoảng trắng. Backend có thể match sai.';
  if (type === 'image' && label.includes('_')) {
    const [, title, extra] = label.split('_');
    if (!title) return 'Thiếu title sau dấu _. Ví dụ: 176-180(1)_webpage.';
    if (extra !== undefined) return 'Title chỉ dùng một dấu _ để tách khỏi range, không dùng _ trong title.';
    if (!/^[a-z0-9-]+$/.test(title)) return 'Title ảnh nên lowercase, không dấu, nối từ bằng dấu -, không dùng space hoặc _.';
  }
  if (/^\d+$/.test(label)) return 'Label số đơn chỉ nên là q_number thật. Với Part 3/4, dùng range như 32-34 hoặc p03-q032-034.';
  return '';
};

export const getUploadStatusLabel = (status: UploadItem['status']) => {
  if (status === 'queued') return 'Chờ tải';
  if (status === 'uploading') return 'Đang tải';
  if (status === 'uploaded') return 'Đã tải';
  return 'Lỗi';
};

export const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};
