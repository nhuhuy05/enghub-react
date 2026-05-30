import { Headphones } from 'lucide-react';
import type { MediaAsset, QuestionGroupDetail } from '../../types/teacherTestTypes';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import type { DirtyPatch } from './reviewGroupUtils';

interface AudioTranscriptEditorProps {
  detail: QuestionGroupDetail;
  audioAssets: MediaAsset[];
  setDetailValue: (updater: (current: QuestionGroupDetail) => QuestionGroupDetail, dirtyPatch: DirtyPatch) => void;
}

export const AudioTranscriptEditor = ({ detail, audioAssets, setDetailValue }: AudioTranscriptEditorProps) => {
  if (detail.part_number > 4) return null;

  return (
    <div className="rounded-2xl border border-[#e4e7ec] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <Headphones className="h-4 w-4 text-[#004ac6]" />
          Audio và Transcript
        </h4>
        {detail.audio && (
          <button
            onClick={() =>
              setDetailValue((current) => ({
                ...current,
                audio: null,
              }), { audio: true })
            }
            className="rounded-lg border border-[#fecdca] px-3 py-2 text-xs font-bold text-[#d92d20]"
          >
            Xóa
          </button>
        )}
        {!detail.audio && (
          <button
            onClick={() => {
              const firstAudio = audioAssets[0];
              if (!firstAudio) return;
              setDetailValue((current) => ({
                ...current,
                audio: {
                  media_asset_id: firstAudio.id,
                  label: firstAudio.label,
                  url: firstAudio.url,
                  start_ms: null,
                  end_ms: null,
                  transcript_en: '',
                  transcript_vi: '',
                },
              }), { audio: true });
            }}
            className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold"
          >
            Gắn Audio
          </button>
        )}
      </div>
      {!detail.audio ? (
        <p className="text-xs font-semibold text-[#667085]">Chưa gắn Audio.</p>
      ) : (
        <div className="space-y-3">
          <select
            value={detail.audio.media_asset_id}
            onChange={(event) => {
              const mediaId = Number(event.target.value);
              const media = audioAssets.find((asset) => asset.id === mediaId);
              setDetailValue((current) => ({
                ...current,
                audio: current.audio
                  ? { ...current.audio, media_asset_id: mediaId, label: media?.label, url: media?.url, start_ms: null, end_ms: null }
                  : current.audio,
              }), { audio: true });
            }}
            className="w-full rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
          >
            {audioAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label}
              </option>
            ))}
          </select>
          {detail.audio.url && <audio controls src={detail.audio.url} className="w-full" />}
          <AutoResizeTextarea
            value={detail.audio.transcript_en ?? ''}
            onChange={(event) =>
              setDetailValue((current) => ({
                ...current,
                audio: current.audio ? { ...current.audio, transcript_en: event.target.value } : current.audio,
              }), { audio: true })
            }
            placeholder="Transcript EN"
          />
          <AutoResizeTextarea
            value={detail.audio.transcript_vi ?? ''}
            onChange={(event) =>
              setDetailValue((current) => ({
                ...current,
                audio: current.audio ? { ...current.audio, transcript_vi: event.target.value } : current.audio,
              }), { audio: true })
            }
            placeholder="Transcript VI"
          />
        </div>
      )}
    </div>
  );
};
