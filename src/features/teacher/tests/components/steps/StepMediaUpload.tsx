import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  FileAudio,
  Loader2,
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { MediaAsset } from '../../types/teacherTestTypes';
import { MediaTable } from '../media-upload/MediaTable';
import { UploadQueuePanel } from '../media-upload/UploadQueuePanel';
import {
  detectMediaType,
  getErrorMessage,
  getFileStem,
  getLabelWarning,
  type UploadItem,
} from '../media-upload/mediaUploadUtils';

interface StepMediaUploadProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}


export const StepMediaUpload = ({ testId, nextStep, prevStep }: StepMediaUploadProps) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await teacherTestService.getTestMedia(testId);
      if (res.code === 1000) {
        setMediaAssets(res.result || []);
      } else {
        setErrorMsg(res.message || 'Không thể tải danh sách Media.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải danh sách Media.'));
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
    const labelWarning = getLabelWarning(label, item.type);
    if (!label || labelWarning.startsWith('Bỏ')) {
      updateUploadItem(item.id, { status: 'failed', error: labelWarning || 'Label không hợp lệ.' });
      return;
    }

    updateUploadItem(item.id, { status: 'uploading', error: undefined });
    try {
      const res = await teacherTestService.uploadMedia(testId, item.file, label, item.type);
      if (res.code !== 1000) throw new Error(res.message || 'Tải file thất bại.');
      updateUploadItem(item.id, { status: 'uploaded' });
      setMediaAssets((prev) => {
        const withoutSame = prev.filter((asset) => !(asset.label === res.result.label && asset.media_type === res.result.media_type));
        return [...withoutSame, res.result];
      });
    } catch (err) {
      updateUploadItem(item.id, { status: 'failed', error: getErrorMessage(err, 'Tải file thất bại.') });
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
    setSuccessMsg('Đã tải xong hàng đợi.');
    await fetchMedia();
  };

  const deleteMedia = async (assetId: number) => {
    try {
      setDeletingId(assetId);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await teacherTestService.deleteMedia(testId, assetId);
      if (res.code !== 1000) throw new Error(res.message || 'Xóa file thất bại.');
      setMediaAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      setDeleteTarget(null);
      setSuccessMsg('Đã xóa Media.');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Xóa file thất bại.'));
    } finally {
      setDeletingId(null);
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
      if (res.code !== 1000) throw new Error(res.message || 'Cập nhật file thất bại.');
      setMediaAssets((prev) => prev.map((asset) => (asset.id === updatingId ? res.result : asset)));
      setSuccessMsg('Đã cập nhật file Media.');
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cập nhật file thất bại.'));
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
        <section className="min-h-0 lg:col-span-4">
          <UploadQueuePanel
            uploadItems={uploadItems}
            uploading={uploading}
            onFilesChange={handleFilesChange}
            onUpdateItem={updateUploadItem}
            onUploadOne={(item) => void uploadOne(item)}
            onUploadQueued={() => void uploadQueued()}
          />
        </section>

        <section className="min-h-0 space-y-4 lg:col-span-8">
          {loading ? (
            <div className="rounded-2xl border border-[#d8dced] bg-white p-8 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#004ac6]" />
              <p className="mt-3 text-xs font-semibold text-[#667085]">Đang tải Media...</p>
            </div>
          ) : (
            <>
              <MediaTable
                title={`File Media (${mediaAssets.length})`}
                icon={<FileAudio className="h-4.5 w-4.5 text-[#004ac6]" />}
                assets={mediaAssets}
                onRequestDelete={(asset) => setDeleteTarget(asset)}
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#fecdca] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#111827]">Xóa file Media?</h3>
            <p className="mt-2 text-xs leading-5 text-[#667085]">
              File <strong className="text-[#111827]">{deleteTarget.label}</strong> sẽ bị xóa khỏi đề thi.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!deletingId) setDeleteTarget(null);
                }}
                disabled={Boolean(deletingId)}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void deleteMedia(deleteTarget.id)}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#d92d20] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-3">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8dced] bg-white px-3 py-2 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Tiếp tục
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

