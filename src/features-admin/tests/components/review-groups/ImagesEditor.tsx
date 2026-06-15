import { Image as ImageIcon } from 'lucide-react';
import type { MediaAsset, QuestionGroupDetail } from '../../types/adminTestTypes';
import type { DirtyPatch } from './reviewGroupUtils';

interface ImagesEditorProps {
  detail: QuestionGroupDetail;
  imageAssets: MediaAsset[];
  setDetailValue: (updater: (current: QuestionGroupDetail) => QuestionGroupDetail, dirtyPatch: DirtyPatch) => void;
  addImage: () => void;
}

export const ImagesEditor = ({ detail, imageAssets, setDetailValue, addImage }: ImagesEditorProps) => {
  if (![1, 3, 4].includes(detail.part_number)) return null;

  return (
    <div className="rounded-2xl border border-[#e4e7ec] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <ImageIcon className="h-4 w-4 text-[#004ac6]" />
          Images
        </h4>
        <div className="flex gap-2">
          <button onClick={addImage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
            Thêm image
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {detail.images.map((image, index) => (
          <div key={`${image.media_asset_id}-${index}`} className="rounded-xl bg-[#f9fafb] p-3">
            <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
              <select
                value={image.media_asset_id}
                onChange={(event) => {
                  const mediaId = Number(event.target.value);
                  const media = imageAssets.find((asset) => asset.id === mediaId);
                  setDetailValue((current) => ({
                    ...current,
                    images: current.images.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, media_asset_id: mediaId, label: media?.label, url: media?.url }
                        : item
                    ),
                  }), { images: true });
                }}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
              >
                {imageAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setDetailValue((current) => ({
                    ...current,
                    images: current.images.filter((_, itemIndex) => itemIndex !== index),
                  }), { images: true })
                }
                className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
              >
                Xóa
              </button>
              {image.url && <img src={image.url} alt={image.label || 'group image'} className="max-h-52 rounded-lg border border-[#e4e7ec] object-contain" />}
            </div>
          </div>
        ))}
        {detail.images.length === 0 && <p className="text-xs font-semibold text-[#667085]">Chưa gắn image nào.</p>}
      </div>
    </div>
  );
};
