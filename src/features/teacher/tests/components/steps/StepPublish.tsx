import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Globe, Loader2, RefreshCw } from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PreviewResult, PublishResult, Test } from '../../types/teacherTestTypes';

interface StepPublishProps {
  testId: number;
  collectionId?: number | null;
  prevStep: () => void;
  onComplete: () => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const StepPublish = ({ testId, prevStep, onComplete }: StepPublishProps) => {
  const [test, setTest] = useState<Test | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

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
      if (testRes.code === 1000) setTest(testRes.result);
      if (previewRes.code === 1000) setPreview(previewRes.result);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Cannot load publish status.'));
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
      if (res.code !== 1000) throw new Error(res.message || 'Publish failed.');
      setPublishResult(res.result);

      const testRes = await teacherTestService.getTestById(testId);
      if (testRes.code === 1000) setTest(testRes.result);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Publish failed.'));
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish this test? Students will no longer see it until it is published again.')) return;

    try {
      setUnpublishing(true);
      setErrorMsg('');
      setSuccessMsg('');
      setPublishResult(null);

      const res = await teacherTestService.unpublishTest(testId);
      if (res.code !== 1000) throw new Error(res.message || 'Unpublish failed.');
      if (!res.result.success) {
        setPublishResult(res.result);
        return;
      }

      setSuccessMsg('Test unpublished. You can edit, preview, and publish it again.');
      await loadStatus(false);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Unpublish failed.'));
    } finally {
      setUnpublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Loading publish status...</p>
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
          <h2 className="text-2xl font-black text-[#111827]">Published successfully</h2>
          <p className="text-sm leading-relaxed text-[#667085]">
            {test?.title || 'This test'} is now public. Workflow: {test?.workflow_status || 'published'}.
          </p>
        </div>
        {test && <TestSummary test={test} />}
        <button
          onClick={onComplete}
          className="w-full rounded-xl bg-[#004ac6] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Back to test list
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
        <ErrorList title="Publish errors" errors={publishResult.errors} />
      )}

      {preview && !preview.publishable && <ErrorList title="Preview validation errors" errors={preview.errors} />}

      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-[#d8dced] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#004ac6]">
          <Globe className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#111827]">Ready to publish?</h3>
          <p className="text-sm leading-relaxed text-[#667085]">
            Backend validation is checked one more time before publishing. Students can see the test after this action.
          </p>
        </div>

        {test && <TestSummary test={test} />}

        {preview && (
          <div className="grid grid-cols-2 gap-3 text-left text-xs">
            <Metric label="Questions" value={`${preview.question_count}/200`} ok={preview.question_count === 200} />
            <Metric label="Invalid answers" value={`${preview.invalid_correct_answer_count}`} ok={preview.invalid_correct_answer_count === 0} />
            <Metric label="Missing images" value={`${preview.part1_missing_image_count}`} ok={preview.part1_missing_image_count === 0} />
            <Metric label="Missing audio" value={`${preview.listening_missing_audio_range_count}`} ok={preview.listening_missing_audio_range_count === 0} />
            <Metric label="Missing passage" value={`${preview.reading_missing_passage_count}`} ok={preview.reading_missing_passage_count === 0} />
            <Metric label="Publishable" value={preview.publishable ? 'Yes' : 'No'} ok={preview.publishable} />
          </div>
        )}

        <div className="space-y-3 pt-2">
          {test?.is_published && (
            <button
              onClick={() => void handleUnpublish()}
              disabled={publishing || unpublishing}
              className="w-full rounded-xl border border-[#fecdca] bg-white py-3.5 text-sm font-bold text-[#b42318] transition hover:bg-[#fff1f0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {unpublishing ? 'Unpublishing...' : 'Unpublish'}
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || unpublishing || !publishable}
            className="w-full rounded-xl bg-[#004ac6] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#003da3] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? 'Publishing...' : 'Publish now'}
          </button>
          {!publishable && (
            <p className="text-xs font-semibold text-[#b42318]">Fix validation errors in Review Groups before publishing.</p>
          )}
          <button
            onClick={() => void loadStatus()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh validation
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          disabled={publishing || unpublishing}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb] disabled:opacity-40"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to preview
        </button>
      </div>
    </div>
  );
};

const TestSummary = ({ test }: { test: Test }) => (
  <div className="space-y-2 rounded-2xl border border-[#e4e7ec] bg-[#f9fafb] p-4 text-left text-xs">
    <p className="flex justify-between gap-4">
      <span className="font-semibold text-[#667085]">Title:</span>
      <strong className="text-right text-[#111827]">{test.title}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Questions:</span>
      <strong className="text-[#111827]">{test.total_questions}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Duration:</span>
      <strong className="text-[#111827]">{test.duration_minutes} minutes</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Workflow:</span>
      <strong className="text-[#111827]">{test.workflow_status || 'draft'}</strong>
    </p>
    <p className="flex justify-between">
      <span className="font-semibold text-[#667085]">Published:</span>
      <strong className="text-[#111827]">{test.is_published ? 'Yes' : 'No'}</strong>
    </p>
  </div>
);

const Metric = ({ label, value, ok }: { label: string; value: string; ok: boolean }) => (
  <div className={`rounded-xl border p-3 ${ok ? 'border-[#d3f5d5] bg-[#edfcf2]' : 'border-[#fecdca] bg-[#fff1f0]'}`}>
    <p className="text-[10px] font-bold uppercase text-[#667085]">{label}</p>
    <p className={`mt-1 text-sm font-black ${ok ? 'text-[#027a48]' : 'text-[#b42318]'}`}>{value}</p>
  </div>
);

const ErrorList = ({ title, errors }: { title: string; errors: string[] }) => (
  <div className="space-y-3 rounded-2xl border border-[#fecdca] bg-[#fff1f0] p-5">
    <div className="flex items-center gap-2 text-[#d92d20]">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <h4 className="text-sm font-bold">{title}</h4>
    </div>
    {errors.length === 0 ? (
      <p className="text-xs font-semibold text-[#d92d20]">Backend did not return detailed errors.</p>
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
