import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  FileAudio,
  Image as ImageIcon,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { MediaAsset } from '../../types/teacherTestTypes';

interface StepMediaUploadProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

interface UploadItem {
  id: string;
  file: File;
  label: string;
  type: 'image' | 'audio';
  status: 'queued' | 'uploading' | 'uploaded' | 'failed';
  error?: string;
}

const getFileStem = (filename: string) => filename.replace(/\.[^/.]+$/, '');

const detectMediaType = (file: File): 'image' | 'audio' => {
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  return /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name) ? 'audio' : 'image';
};

const getLabelWarning = (label: string) => {
  if (!label.trim()) return 'Label is required.';
  if (/\.[a-z0-9]{2,5}$/i.test(label)) return 'Remove file extension from label.';
  if (/\s+\(\d+\)$/.test(label)) return 'Remove space before image suffix, for example 176-180(1).';
  if (/\s/.test(label)) return 'Label contains whitespace. Backend matching may fail.';
  if (/^\d+$/.test(label)) return 'Single-number labels should be real q_number only. For Part 3/4, use a range like 32-34 or p03-q032-034.';
  return '';
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const StepMediaUpload = ({ testId, nextStep, prevStep }: StepMediaUploadProps) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaAsset | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await teacherTestService.getTestMedia(testId);
      if (res.code === 1000) {
        setMediaAssets(res.result || []);
      } else {
        setErrorMsg(res.message || 'Cannot load media.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot load media.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMedia();
  }, [testId]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        label: getFileStem(file.name),
        type: detectMediaType(file),
        status: 'queued' as const,
      })),
    ]);
    event.target.value = '';
  };

  const updateUploadItem = (id: string, patch: Partial<UploadItem>) => {
    setUploadItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadOne = async (item: UploadItem) => {
    const label = item.label.trim();
    const labelWarning = getLabelWarning(label);
    if (!label || labelWarning.startsWith('Remove')) {
      updateUploadItem(item.id, { status: 'failed', error: labelWarning || 'Invalid label.' });
      return;
    }

    updateUploadItem(item.id, { status: 'uploading', error: undefined });
    try {
      const res = await teacherTestService.uploadMedia(testId, item.file, label, item.type);
      if (res.code !== 1000) throw new Error(res.message || 'Upload failed.');
      updateUploadItem(item.id, { status: 'uploaded' });
      setMediaAssets((prev) => {
        const withoutSame = prev.filter((asset) => !(asset.label === res.result.label && asset.media_type === res.result.media_type));
        return [...withoutSame, res.result];
      });
    } catch (err) {
      updateUploadItem(item.id, { status: 'failed', error: getErrorMessage(err, 'Upload failed.') });
    }
  };

  const uploadQueued = async () => {
    const targets = uploadItems.filter((item) => item.status === 'queued' || item.status === 'failed');
    if (!targets.length) return;
    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    for (const item of targets) {
      await uploadOne(item);
    }
    setUploading(false);
    setSuccessMsg('Upload queue completed.');
    await fetchMedia();
  };

  const deleteMedia = async (assetId: number) => {
    if (!window.confirm('Delete this media file?')) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await teacherTestService.deleteMedia(testId, assetId);
      if (res.code !== 1000) throw new Error(res.message || 'Delete failed.');
      setMediaAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      setSuccessMsg('Media deleted.');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Delete failed.'));
    }
  };

  const triggerUpdate = (assetId: number) => {
    setUpdatingId(assetId);
    updateFileInputRef.current?.click();
  };

  const handleUpdateFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !updatingId) return;

    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await teacherTestService.updateMedia(testId, updatingId, file);
      if (res.code !== 1000) throw new Error(res.message || 'Update failed.');
      setMediaAssets((prev) => prev.map((asset) => (asset.id === updatingId ? res.result : asset)));
      setSuccessMsg('Media file updated.');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Update failed.'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex max-h-[calc(100vh-205px)] min-h-[520px] flex-col space-y-3 overflow-hidden">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-semibold text-[#b42318]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-4 text-sm font-semibold text-[#027a48]">
          <Check className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <input ref={updateFileInputRef} type="file" accept="image/*,audio/*" className="hidden" onChange={handleUpdateFile} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        <section className="min-h-0 lg:col-span-5">
          <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-3">
            <h3 className="mb-2 text-sm font-bold text-[#111827]">Upload media files</h3>
            <div className="relative rounded-xl border-2 border-dashed border-[#d8dced] bg-white p-3 text-center transition hover:border-[#004ac6]">
              <input
                type="file"
                multiple
                onChange={handleFilesChange}
                accept="image/*,audio/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={uploading}
              />
              <Upload className="mx-auto mb-1.5 h-6 w-6 text-[#98a2b3]" />
              <p className="text-sm font-bold text-[#344054]">Drop or click to select files</p>
              <p className="mt-1 text-xs text-[#667085]">Images and audio. Labels are generated from filename.</p>
            </div>

            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {uploadItems.map((item) => {
                const labelWarning = getLabelWarning(item.label);
                return (
                  <div key={item.id} className="rounded-xl border border-[#e4e7ec] bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-[#111827]">{item.file.name}</p>
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
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        value={item.label}
                        onChange={(event) => updateUploadItem(item.id, { label: event.target.value })}
                        className="rounded-lg border border-[#d8dced] px-3 py-2 text-sm"
                        disabled={item.status === 'uploading' || item.status === 'uploaded'}
                      />
                      <select
                        value={item.type}
                        onChange={(event) => updateUploadItem(item.id, { type: event.target.value as 'image' | 'audio' })}
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
                        onClick={() => void uploadOne(item)}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#d8dced] px-3 py-1.5 text-xs font-bold"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => void uploadQueued()}
              disabled={uploading || !uploadItems.some((item) => item.status === 'queued' || item.status === 'failed')}
              className="mt-3 w-full shrink-0 rounded-lg bg-[#004ac6] py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#003da3] disabled:opacity-40"
            >
              {uploading ? 'Uploading...' : 'Upload queued files'}
            </button>
          </div>
        </section>

        <section className="min-h-0 space-y-4 lg:col-span-7">
          {loading ? (
            <div className="rounded-2xl border border-[#d8dced] bg-white p-8 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#004ac6]" />
              <p className="mt-3 text-xs font-semibold text-[#667085]">Loading media...</p>
            </div>
          ) : (
            <>
              <MediaTable
                title={`Media files (${mediaAssets.length})`}
                icon={<FileAudio className="h-4.5 w-4.5 text-[#004ac6]" />}
                assets={mediaAssets}
                onDelete={deleteMedia}
                onUpdate={triggerUpdate}
                onRefresh={fetchMedia}
                onPreviewImage={setPreviewImage}
              />
            </>
          )}
        </section>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage.url}
            alt={previewImage.label}
            className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-3">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface MediaTableProps {
  title: string;
  icon: ReactNode;
  assets: MediaAsset[];
  onDelete: (assetId: number) => void;
  onUpdate: (assetId: number) => void;
  onRefresh: () => void;
  onPreviewImage: (asset: MediaAsset) => void;
}

const MediaTable = ({ title, icon, assets, onDelete, onUpdate, onRefresh, onPreviewImage }: MediaTableProps) => (
  <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#d8dced] bg-white p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between border-b border-[#f3f5fb] pb-2">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
        {icon}
        {title}
      </h3>
      <button
        onClick={() => void onRefresh()}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8dced] text-[#344054] hover:bg-[#f9fafb]"
        title="Refresh"
        aria-label="Refresh media"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
    {assets.length === 0 ? (
      <p className="py-8 text-center text-xs font-semibold text-[#667085]">No files uploaded.</p>
    ) : (
      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#f9fafb] text-[#344054]">
            <tr>
              <th className="px-3 py-2">Preview</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Filename</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Actions</th>
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
                      title="Preview image"
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
                      Update
                    </button>
                    <button
                      onClick={() => onDelete(asset.id)}
                      className="rounded-lg border border-[#fecdca] p-2 text-[#d92d20] hover:bg-[#fef3f2]"
                      title="Delete"
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

const CompactAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex w-[172px] items-center gap-2 rounded-full bg-[#f3f5f7] px-2.5 py-1.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#111827] shadow-sm hover:bg-[#eaf0ff] hover:text-[#004ac6]"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#505f76]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const nextTime = Number(event.target.value);
            setCurrentTime(nextTime);
            if (audioRef.current) {
              audioRef.current.currentTime = nextTime;
            }
          }}
          className="h-1 w-full cursor-pointer accent-[#004ac6]"
        />
      </div>
    </div>
  );
};
