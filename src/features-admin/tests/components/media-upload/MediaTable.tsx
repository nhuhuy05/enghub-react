import type { ReactNode } from 'react';
import { FileAudio, Image as ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import type { MediaAsset } from '../../types/adminTestTypes';
import { CompactAudioPlayer } from './CompactAudioPlayer';

interface MediaTableProps {
  title: string;
  icon: ReactNode;
  assets: MediaAsset[];
  onRequestDelete: (asset: MediaAsset) => void;
  onUpdate: (assetId: number) => void;
  onRefresh: () => void;
  onPreviewImage: (asset: MediaAsset) => void;
}

export const MediaTable = ({ title, icon, assets, onRequestDelete, onUpdate, onRefresh, onPreviewImage }: MediaTableProps) => (
  <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#d8dced] bg-white p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between border-b border-[#f3f5fb] pb-2">
      <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
        {icon}
        {title}
      </h3>
      <button
        onClick={() => void onRefresh()}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8dced] text-[#344054] hover:bg-[#f9fafb]"
        title="Làm mới"
        aria-label="Làm mới Media"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
    {assets.length === 0 ? (
      <p className="py-8 text-center text-xs font-semibold text-[#667085]">Chưa có file nào được tải lên.</p>
    ) : (
      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#f9fafb] text-[#344054]">
            <tr>
              <th className="px-3 py-2">Preview</th>
              <th className="px-3 py-2">Loại</th>
              <th className="px-3 py-2">Tên file</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e7ec]">
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-3 py-1.5">
                  {asset.media_type === 'image' ? (
                    <button
                      onClick={() => onPreviewImage(asset)}
                      className="group h-12 w-20 overflow-hidden rounded border border-[#e4e7ec] bg-white"
                      title="Preview ảnh"
                    >
                      <img src={asset.url} alt={asset.label} className="h-full w-full object-contain transition group-hover:scale-105" />
                    </button>
                  ) : (
                    <CompactAudioPlayer src={asset.url} />
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                      asset.media_type === 'image' ? 'bg-[#f0f4ff] text-[#004ac6]' : 'bg-[#edfcf2] text-[#027a48]'
                    }`}
                  >
                    {asset.media_type === 'image' ? <ImageIcon className="h-3 w-3" /> : <FileAudio className="h-3 w-3" />}
                    {asset.media_type}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-3 py-1.5 font-semibold text-[#111827]">{asset.original_filename}</td>
                <td className="px-3 py-1.5 font-bold text-[#004ac6]">{asset.label}</td>
                <td className="px-3 py-1.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(asset.id)}
                      className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold text-[#344054]"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => onRequestDelete(asset)}
                      className="rounded-lg border border-[#fecdca] p-2 text-[#d92d20] hover:bg-[#fef3f2]"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
