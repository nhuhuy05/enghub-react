import { RefreshCw, Upload } from 'lucide-react';
import {
  getLabelWarning,
  getUploadStatusLabel,
  type UploadItem,
} from './mediaUploadUtils';

interface UploadQueuePanelProps {
  uploadItems: UploadItem[];
  uploading: boolean;
  onFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateItem: (id: string, patch: Partial<UploadItem>) => void;
  onUploadOne: (item: UploadItem) => void;
  onUploadQueued: () => void;
}

export const UploadQueuePanel = ({
  uploadItems,
  uploading,
  onFilesChange,
  onUpdateItem,
  onUploadOne,
  onUploadQueued,
}: UploadQueuePanelProps) => (
  <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-[#111827]">Tải file Media</h3>
      {uploadItems.length > 0 && (
        <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8dced] bg-white px-3 py-1.5 text-xs font-bold text-[#344054] transition hover:bg-[#f9fafb]">
          <Upload className="h-3.5 w-3.5" />
          Chọn thêm
          <input
            type="file"
            multiple
            onChange={onFilesChange}
            accept="image/*,audio/*"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            disabled={uploading}
          />
        </label>
      )}
    </div>

    {uploadItems.length === 0 && (
      <div className="relative rounded-xl border-2 border-dashed border-[#d8dced] bg-white p-3 text-center transition hover:border-[#004ac6]">
        <input
          type="file"
          multiple
          onChange={onFilesChange}
          accept="image/*,audio/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={uploading}
        />
        <Upload className="mx-auto mb-1.5 h-6 w-6 text-[#98a2b3]" />
        <p className="text-sm font-bold text-[#344054]">Kéo thả hoặc bấm để chọn file</p>
        <p className="mt-1 text-xs text-[#667085]">Image và Audio. Label được tạo từ tên file.</p>
      </div>
    )}

    <div className={`${uploadItems.length === 0 ? 'mt-3' : 'mt-1'} min-h-0 flex-1 space-y-2 overflow-y-auto pr-1`}>
      {uploadItems.map((item) => {
        const labelWarning = getLabelWarning(item.label, item.type);
        return (
          <div key={item.id} className="rounded-xl border border-[#e4e7ec] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#111827]">{item.file.name}</p>
                <p className="text-[10px] font-semibold text-[#667085]">
                  {item.type} - {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.status === 'uploaded'
                    ? 'bg-[#edfcf2] text-[#027a48]'
                    : item.status === 'failed'
                      ? 'bg-[#fef3f2] text-[#b42318]'
                      : item.status === 'uploading'
                        ? 'bg-[#eaf0ff] text-[#004ac6]'
                        : 'bg-[#f3f5fb] text-[#505f76]'
                }`}
              >
                {getUploadStatusLabel(item.status)}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={item.label}
                onChange={(event) => onUpdateItem(item.id, { label: event.target.value })}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                disabled={item.status === 'uploading' || item.status === 'uploaded'}
              />
              <select
                value={item.type}
                onChange={(event) => onUpdateItem(item.id, { type: event.target.value as UploadItem['type'] })}
                className="rounded-lg border border-[#d8dced] px-2 py-2 text-sm"
                disabled={item.status === 'uploading' || item.status === 'uploaded'}
              >
                <option value="image">Image</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            {labelWarning && <p className="mt-1 text-[10px] font-semibold text-[#b25e00]">{labelWarning}</p>}
            {item.error && <p className="mt-1 text-[10px] font-semibold text-[#b42318]">{item.error}</p>}
            {item.status === 'failed' && (
              <button
                onClick={() => onUploadOne(item)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Thử lại
              </button>
            )}
          </div>
        );
      })}
    </div>

    <button
      onClick={onUploadQueued}
      disabled={uploading || !uploadItems.some((item) => item.status === 'queued' || item.status === 'failed')}
      className="mt-3 w-full shrink-0 rounded-lg bg-[#004ac6] py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#003da3] disabled:opacity-40"
    >
      {uploading ? 'Đang tải...' : 'Tải các file trong hàng đợi'}
    </button>
  </div>
);
