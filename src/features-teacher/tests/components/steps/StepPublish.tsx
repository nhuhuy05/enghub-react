import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Globe, Loader2, RefreshCw } from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PreviewResult, PublishResult, Test } from '../../types/teacherTestTypes';

interface StepPublishProps {
  testId: number;
  collectionId?: number | null;
  prevStep: () => void;
  onComplete: () => void;
  isEditLocked?: boolean;
  onStatusChange?: (test: Test) => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

const getWorkflowStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    draft: 'Bản nháp',
    media_uploaded: 'Đã tải Media',
    imported: 'Đã import',
    reviewing: 'Đang review',
    preview_ready: 'Sẵn sàng Preview',
    published: 'Đã xuất bản',
  };
  return status ? labels[status] || status : 'Bản nháp';
};

export const StepPublish = ({ testId, prevStep, onComplete, isEditLocked = false, onStatusChange }: StepPublishProps) => {
  const [test, setTest] = useState<Test | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  const loadStatus = async (clearMessages = true) => {
    try {
      setLoading(true);
      if (clearMessages) {
        setErrorMsg('');
        setSuccessMsg('');
      }
      const [testRes, previewRes] = await Promise.all([
        teacherTestService.getTestById(testId),
        teacherTestService.previewTest(testId),
      ]);
      if (testRes.code === 1000) {
        setTest(testRes.result);
        onStatusChange?.(testRes.result);
      }
      if (previewRes.code === 1000) setPreview(previewRes.result);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải trạng thái xuất bản.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatus();
  }, [testId]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setErrorMsg('');
      setSuccessMsg('');
      setPublishResult(null);

      const previewRes = await teacherTestService.previewTest(testId);
      if (previewRes.code === 1000) {
        setPreview(previewRes.result);
        if (!previewRes.result.publishable) {
          setPublishing(false);
          return;
        }
      }

      const res = await teacherTestService.publishTest(testId);
      if (res.code !== 1000) throw new Error(res.message || 'Xuất bản thất bại.');
      setPublishResult(res.result);

      const testRes = await teacherTestService.getTestById(testId);
      if (testRes.code === 1000) {
        setTest(testRes.result);
        onStatusChange?.(testRes.result);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Xuất bản thất bại.'));
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setUnpublishing(true);
      setErrorMsg('');
      setSuccessMsg('');
      setPublishResult(null);

      const res = await teacherTestService.unpublishTest(testId);
      if (res.code !== 1000) throw new Error(res.message || 'Ẩn xuất bản thất bại.');
      if (!res.result.success) {
        setPublishResult(res.result);
        return;
      }

      setSuccessMsg('Đã ẩn xuất bản. Bạn có thể chỉnh sửa, Preview và xuất bản lại.');
      setConfirmUnpublish(false);
      await loadStatus(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Ẩn xuất bản thất bại.'));
    } finally {
      setUnpublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải trạng thái xuất bản...</p>
      </div>
    );
  }

  if (publishResult?.success) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d3f5d5] bg-[#edfcf2] text-[#027a48] shadow-md">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#111827]">Xuất bản thành công</h2>
          <p className="text-sm leading-relaxed text-[#667085]">
            {test?.title || 'Đề thi này'} đã được công khai. Workflow: {getWorkflowStatusLabel(test?.workflow_status || 'published')}.
          </p>
        </div>
        {test && <TestSummary test={test} />}
        <button
          onClick={onComplete}
          className="w-full rounded-xl bg-[#004ac6] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Quay lại danh sách đề
        </button>
      </div>
    );
  }

  const publishable = Boolean(preview?.publishable);

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-semibold text-[#b42318]">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#d3f5d5] bg-[#edfcf2] p-4 text-sm font-semibold text-[#027a48]">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {publishResult && !publishResult.success && (
        <ErrorList title="Lỗi xuất bản" errors={publishResult.errors} />
      )}

      {preview && !preview.publishable && <ErrorList title="Lỗi validation Preview" errors={preview.errors} />}

      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-[#d8dced] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#004ac6]">
          <Globe className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#111827]">Sẵn sàng xuất bản?</h3>
          <p className="text-sm leading-relaxed text-[#667085]">
            Backend sẽ kiểm tra validation thêm một lần trước khi xuất bản. Học viên có thể thấy đề sau thao tác này.
          </p>
        </div>

        {test && <TestSummary test={test} />}

        {preview && (
          <div className="grid grid-cols-2 gap-3 text-left text-xs">
            <Metric label="Questions" value={`${preview.question_count}/200`} ok={preview.question_count === 200} />
            <Metric label="Answer lỗi" value={`${preview.invalid_correct_answer_count}`} ok={preview.invalid_correct_answer_count === 0} />
            <Metric label="Thiếu images" value={`${preview.part1_missing_image_count}`} ok={preview.part1_missing_image_count === 0} />
            <Metric label="Thiếu Audio" value={`${preview.listening_missing_audio_range_count}`} ok={preview.listening_missing_audio_range_count === 0} />
            <Metric label="Thiếu passage" value={`${preview.reading_missing_passage_count}`} ok={preview.reading_missing_passage_count === 0} />
            <Metric label="Có thể xuất bản" value={preview.publishable ? 'Có' : 'Không'} ok={preview.publishable} />
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={test?.is_published ? () => setConfirmUnpublish(true) : handlePublish}
            disabled={publishing || unpublishing || (!test?.is_published && !publishable)}
            className={`w-full rounded-xl py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              test?.is_published
                ? 'border border-[#fecdca] bg-white text-[#b42318] hover:bg-[#fff1f0]'
                : 'bg-[#004ac6] text-white shadow-md hover:bg-[#003da3]'
            }`}
          >
            {test?.is_published
              ? unpublishing
                ? 'Đang ẩn xuất bản...'
                : 'Ẩn xuất bản'
              : publishing
                ? 'Đang xuất bản...'
                : 'Xuất bản ngay'}
          </button>
          {!test?.is_published && !publishable && (
            <p className="text-xs font-semibold text-[#b42318]">Sửa lỗi validation trong Review nhóm câu trước khi xuất bản.</p>
          )}
          <button
            onClick={() => void loadStatus()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới validation
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          disabled={publishing || unpublishing || isEditLocked}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb] disabled:opacity-40"
          title={isEditLocked ? 'Ẩn xuất bản trước khi chỉnh sửa.' : undefined}
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại Preview
        </button>
      </div>

      {confirmUnpublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#fecdca] bg-white p-5 text-left shadow-xl">
            <h3 className="text-sm font-bold text-[#111827]">Ẩn xuất bản đề này?</h3>
            <p className="mt-2 text-xs leading-5 text-[#667085]">
              Học viên sẽ không thấy đề cho đến khi bạn xuất bản lại. Sau khi ẩn xuất bản, bạn có thể chỉnh sửa nội dung đề.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmUnpublish(false)}
                disabled={unpublishing}
                className="rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold text-[#344054] disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={unpublishing}
                className="rounded-lg bg-[#d92d20] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                {unpublishing ? 'Đang ẩn...' : 'Ẩn xuất bản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestSummary = ({ test }: { test: Test }) => (
  <div className="space-y-2 rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-4 text-left text-xs">
    <p className="flex justify-between gap-4">
      <span className="font-semibold text-[#667085]">Tiêu đề:</span>
      <strong className="text-right text-[#111827]">{test.title}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Questions:</span>
      <strong className="text-[#111827]">{test.total_questions}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Thời gian:</span>
      <strong className="text-[#111827]">{test.duration_minutes} phút</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Workflow:</span>
      <strong className="text-[#111827]">{getWorkflowStatusLabel(test.workflow_status)}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Đã xuất bản:</span>
      <strong className="text-[#111827]">{test.is_published ? 'Có' : 'Không'}</strong>
    </p>
  </div>
);

const Metric = ({ label, value, ok }: { label: string; value: string; ok: boolean }) => (
  <div className={`rounded-xl border p-3 ${ok ? 'border-[#d3f5d5] bg-[#edfcf2]' : 'border-[#fecdca] bg-[#fff1f0]'}`}>
    <p className="text-[10px] font-bold uppercase text-[#667085]">{label}</p>
    <p className={`mt-1 text-sm font-bold ${ok ? 'text-[#027a48]' : 'text-[#b42318]'}`}>{value}</p>
  </div>
);

const ErrorList = ({ title, errors }: { title: string; errors: string[] }) => (
  <div className="space-y-3 rounded-2xl border border-[#fecdca] bg-[#fff1f0] p-5">
    <div className="flex items-center gap-2 text-[#d92d20]">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <h4 className="text-sm font-bold">{title}</h4>
    </div>
    {errors.length === 0 ? (
      <p className="text-xs font-semibold text-[#d92d20]">Backend không trả chi tiết lỗi.</p>
    ) : (
      <ul className="list-inside list-disc space-y-1 text-xs text-[#d92d20]">
        {errors.map((err, idx) => (
          <li key={idx} className="leading-relaxed">
            {err}
          </li>
        ))}
      </ul>
    )}
  </div>
);
