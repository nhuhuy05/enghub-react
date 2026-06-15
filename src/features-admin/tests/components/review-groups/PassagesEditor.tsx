import { FileText } from 'lucide-react';
import type { GroupPassage, MediaAsset, QuestionGroupDetail } from '../../types/adminTestTypes';
import {
  getMediaName,
  getPassageTitleFromLabel,
  type DirtyPatch,
} from './reviewGroupUtils';

interface PassagesEditorProps {
  detail: QuestionGroupDetail;
  imageAssets: MediaAsset[];
  setDetailValue: (updater: (current: QuestionGroupDetail) => QuestionGroupDetail, dirtyPatch: DirtyPatch) => void;
  addImagePassage: () => void;
}

export const PassagesEditor = ({
  detail,
  imageAssets,
  setDetailValue,
  addImagePassage,
}: PassagesEditorProps) => {
  const updatePassage = (index: number, patch: Partial<GroupPassage>) => {
    setDetailValue((current) => ({
      ...current,
      passages: current.passages.map((passage, itemIndex) =>
        itemIndex === index ? { ...passage, ...patch } : passage
      ),
    }), { passages: true });
  };

  return (
    <div className="rounded-2xl border border-[#e4e7ec] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <FileText className="h-4 w-4 text-[#004ac6]" />
          Passages
        </h4>
        <div className="flex gap-2">
          <button onClick={addImagePassage} className="rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold">
            Thêm image
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {detail.passages.map((passage, index) => (
          <div key={`${passage.id || 'new'}-${index}`} className="rounded-xl bg-[#f9fafb] p-3">
            <div className="mb-3 grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_auto]">
              <select
                value={passage.content_format}
                onChange={(event) => {
                  const contentFormat = event.target.value as 'image' | 'text';
                  updatePassage(index, {
                    content_format: contentFormat,
                    passage_type: contentFormat,
                    media_asset_id: contentFormat === 'text' ? null : imageAssets[0]?.id || null,
                    title:
                      contentFormat === 'text'
                        ? passage.title || ''
                        : passage.title || getPassageTitleFromLabel(imageAssets[0]?.label),
                  });
                }}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
              >
                <option value="image">Image</option>
                <option value="text">Text</option>
              </select>
              {passage.content_format === 'image' ? (
                <select
                  value={passage.media_asset_id || ''}
                  onChange={(event) => {
                    const mediaId = Number(event.target.value);
                    const media = imageAssets.find((asset) => asset.id === mediaId);
                    updatePassage(index, {
                      media_asset_id: mediaId,
                      label: media?.label,
                      url: media?.url,
                      title: passage.title || getPassageTitleFromLabel(media?.label),
                    });
                  }}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                >
                  {imageAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {getMediaName(imageAssets, asset.id)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={passage.title ?? ''}
                  onChange={(event) => updatePassage(index, { title: event.target.value })}
                  placeholder="Tiêu đề"
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
              )}
              <button
                onClick={() =>
                  setDetailValue((current) => ({
                    ...current,
                    passages: current.passages.filter((_, itemIndex) => itemIndex !== index),
                  }), { passages: true })
                }
                className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
              >
                Xóa
              </button>
            </div>

            {passage.content_format === 'image' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[3.5rem_1fr]">
                  <label className="text-sm font-semibold text-[#344054]">Title</label>
                  <input
                    value={passage.title ?? ''}
                    onChange={(event) => updatePassage(index, { title: event.target.value })}
                    placeholder="Ví dụ: brochure article"
                    className="h-11 w-full rounded-lg border border-[#d8dced] px-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#004ac6] focus:ring-2 focus:ring-[#dbe7ff]"
                  />
                </div>
                {passage.url && <img src={passage.url} alt={passage.label || 'passage'} className="max-h-80 rounded-lg border border-[#e4e7ec] object-contain" />}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={passage.content_en ?? ''}
                  onChange={(event) => updatePassage(index, { content_en: event.target.value })}
                  placeholder="Content EN"
                  rows={4}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
                <textarea
                  value={passage.content_vi ?? ''}
                  onChange={(event) => updatePassage(index, { content_vi: event.target.value })}
                  placeholder="Content VI"
                  rows={4}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
                <textarea
                  value={passage.vocab_hints ?? ''}
                  onChange={(event) => updatePassage(index, { vocab_hints: event.target.value })}
                  placeholder="Vocab hints"
                  rows={2}
                  className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        ))}
        {detail.passages.length === 0 && <p className="text-xs font-semibold text-[#667085]">Chưa gắn passage nào.</p>}
      </div>
    </div>
  );
};
