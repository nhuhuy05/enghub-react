import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { teacherTestService } from '../../services/teacherTestService';
import type { PreviewContent, PreviewResult, QuestionGroupDetail, ReviewStatus } from '../../types/teacherTestTypes';

interface StepPreviewProps {
  testId: number;
  nextStep: () => void;
  prevStep: () => void;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

const getReviewStatusLabel = (status: ReviewStatus) => {
  if (status === 'reviewed') return 'Đã review';
  return 'Cần review';
};

const formatQuestionRange = (value: unknown, fallback: number) => {
  if (value === null || value === undefined) return `Group ${fallback}`;
  const normalized = String(value).trim();
  if (!normalized) return `Group ${fallback}`;

  const commaNumbers = normalized
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  if (commaNumbers.length > 1) {
    return `${commaNumbers[0]} - ${commaNumbers[commaNumbers.length - 1]}`;
  }
  if (commaNumbers.length === 1 && normalized.includes(',')) {
    return String(commaNumbers[0]);
  }

  const rangeMatch = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) return `${Number(rangeMatch[1])} - ${Number(rangeMatch[2])}`;

  if (!/^\d+$/.test(normalized)) return normalized;
  if (normalized.length <= 3) return normalized;

  const chunkSize = normalized.length % 3 === 0 ? 3 : normalized.length % 2 === 0 ? 2 : 0;
  if (!chunkSize) return normalized;

  const numbers = normalized.match(new RegExp(`\\d{${chunkSize}}`, 'g')) || [];
  if (numbers.length <= 1) return normalized;
  return `${Number(numbers[0])} - ${Number(numbers[numbers.length - 1])}`;
};

const getGroupTitle = (group: QuestionGroupDetail) => {
  if (group.question_numbers) return `Question ${formatQuestionRange(group.question_numbers, group.group_order)}`;

  const questionNumbers = group.questions
    .map((question) => question.question_number)
    .filter((questionNumber) => Number.isFinite(questionNumber))
    .sort((a, b) => a - b);

  if (questionNumbers.length > 1) {
    return `Question ${questionNumbers[0]} - ${questionNumbers[questionNumbers.length - 1]}`;
  }
  if (questionNumbers.length === 1) return `Question ${questionNumbers[0]}`;

  return `Group ${group.group_order}`;
};

const formatExplanationBlocks = (value: string) =>
  value
    .replace(/\s+(Dẫn chứng\s*\d+\s*(?:\([^)]*\))?\s*:)/gi, '\n$1')
    .replace(/\s+(Suy luận\s*:)/gi, '\n$1')
    .replace(/\s+(Đáp án\s+[A-D]\s+)/gi, '\n$1')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

const ExplanationPreview = ({ value }: { value: string }) => {
  const blocks = formatExplanationBlocks(value);

  return (
    <details className="mt-3 rounded-lg bg-[#f0f4ff] p-3 text-xs text-[#344054]">
      <summary className="cursor-pointer font-bold text-[#004ac6]">Giải thích</summary>
      <div className="mt-3 space-y-2 font-medium leading-5">
        {blocks.map((block, index) => (
          <p key={`${block.slice(0, 24)}-${index}`} className="whitespace-pre-wrap">
            {block}
          </p>
        ))}
      </div>
    </details>
  );
};

export const StepPreview = ({ testId, nextStep, prevStep }: StepPreviewProps) => {
  const [validation, setValidation] = useState<PreviewResult | null>(null);
  const [content, setContent] = useState<PreviewContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activePart, setActivePart] = useState<number | null>(null);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [validationRes, contentRes] = await Promise.all([
        teacherTestService.previewTest(testId),
        teacherTestService.getPreviewContent(testId),
      ]);

      if (validationRes.code === 1000) {
        setValidation(validationRes.result);
      } else {
        setErrorMsg(validationRes.message || 'Không thể tải validation của Preview.');
      }

      if (contentRes.code === 1000) {
        setContent(contentRes.result);
      } else {
        setErrorMsg(contentRes.message || 'Không thể tải nội dung Preview.');
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Không thể tải Preview.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPreview();
  }, [testId]);

  useEffect(() => {
    if (!content?.parts.length) return;
    setActivePart((currentPart) =>
      currentPart && content.parts.some((part) => part.part_number === currentPart)
        ? currentPart
        : content.parts[0].part_number
    );
  }, [content]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="mt-4 text-sm font-semibold text-[#667085]">Đang tải Preview...</p>
      </div>
    );
  }

  if (errorMsg || !validation || !content) {
    return (
      <div className="rounded-2xl border border-[#d8dced] bg-white py-12 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#d92d20]" />
        <h4 className="text-base font-bold text-[#111827]">Preview thất bại</h4>
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-[#667085]">{errorMsg || 'Không có dữ liệu Preview.'}</p>
        <button
          onClick={() => void fetchPreview()}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#004ac6] hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Thử lại
        </button>
      </div>
    );
  }

  const selectedPart = activePart ?? content.parts[0]?.part_number ?? null;
  const visibleParts = selectedPart
    ? content.parts.filter((part) => part.part_number === selectedPart)
    : content.parts;

  return (
    <div className="space-y-6">
      <ValidationPanel validation={validation} onRefresh={fetchPreview} />

      <div className="rounded-2xl border border-[#d8dced] bg-white shadow-sm">
        <div className="border-b border-[#f3f5fb] px-5 py-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#111827]">{content.title}</h3>
              <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                {content.description || 'Không có mô tả'} | {content.duration_minutes} phút
              </p>
            </div>
            <div className="flex max-w-full shrink-0 overflow-x-auto rounded-lg border border-[#d8dced] bg-[#f9fafb] p-1 xl:w-auto">
              {content.parts.map((part) => (
                <button
                  key={part.part_number}
                  onClick={() => setActivePart(part.part_number)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    selectedPart === part.part_number
                      ? 'bg-white text-[#004ac6] shadow-sm'
                      : 'text-[#505f76] hover:bg-white/80'
                  }`}
                >
                  Part {part.part_number}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6">
          {visibleParts.map((part) => (
            <section key={part.part_number} className="space-y-4">
              {part.groups.length === 0 ? (
                <p className="rounded-xl border border-[#e4e7ec] p-4 text-xs font-semibold text-[#667085]">
                  Part này chưa có nhóm câu.
                </p>
              ) : (
                part.groups.map((group) => <PreviewGroup key={group.id} group={group} />)
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#f3f5fb] pt-6">
        <button
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Quay lại Review
        </button>
        <button
          onClick={nextStep}
          className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#003da3]"
        >
          Tiếp tục
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

interface ValidationPanelProps {
  validation: PreviewResult;
  onRefresh: () => void;
}

const ValidationPanel = ({ validation, onRefresh }: ValidationPanelProps) => {
  const checks = [
    { label: 'Số Question', value: `${validation.question_count} / 200`, ok: validation.question_count === 200 },
    {
      label: 'Đáp án đúng lỗi',
      value: `${validation.invalid_correct_answer_count}`,
      ok: validation.invalid_correct_answer_count === 0,
    },
    {
      label: 'Part 1 thiếu image',
      value: `${validation.part1_missing_image_count}`,
      ok: validation.part1_missing_image_count === 0,
    },
    {
      label: 'Listening thiếu Audio',
      value: `${validation.listening_missing_audio_range_count}`,
      ok: validation.listening_missing_audio_range_count === 0,
    },
    {
      label: 'Reading thiếu passage',
      value: `${validation.reading_missing_passage_count}`,
      ok: validation.reading_missing_passage_count === 0,
    },
  ];
  const failedChecks = checks.filter((check) => !check.ok);

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          validation.publishable ? 'border-[#d3f5d5] bg-[#edfcf2]' : 'border-[#fecdca] bg-[#fff1f0]'
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            validation.publishable ? 'bg-[#d3f5d5] text-[#027a48]' : 'bg-[#fecdca] text-[#d92d20]'
          }`}
        >
          {validation.publishable ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </div>
        <div>
          <h4 className={`text-sm font-bold ${validation.publishable ? 'text-[#027a48]' : 'text-[#d92d20]'}`}>
            {validation.publishable ? 'Sẵn sàng xuất bản' : 'Chưa sẵn sàng xuất bản'}
          </h4>
          <p className={`mt-0.5 text-xs ${validation.publishable ? 'text-[#027a48]/90' : 'text-[#d92d20]/90'}`}>
            Backend sẽ tính lại validation. Hãy sửa Review nhóm câu nếu còn lỗi.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/70 bg-white px-3 py-1.5 text-xs font-bold text-[#344054]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Làm mới
        </button>
      </div>

      {failedChecks.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {failedChecks.map((check) => (
            <div key={check.label} className="rounded-xl border border-[#e4e7ec] bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <AlertTriangle className="h-4 w-4 text-[#b42318]" />
                <span className="text-xs font-bold text-[#b42318]">{check.value}</span>
              </div>
              <p className="text-[11px] font-bold text-[#344054]">{check.label}</p>
            </div>
          ))}
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="rounded-2xl border border-[#fee4e2] bg-[#fef3f2] p-5">
          <h4 className="mb-2 text-xs font-bold uppercase text-[#b42318]">Lỗi validation từ backend</h4>
          <ul className="list-inside list-disc space-y-1 text-xs font-semibold text-[#b42318]">
            {validation.errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PreviewGroup = ({ group }: { group: QuestionGroupDetail }) => (
  <article className="rounded-2xl border border-[#e4e7ec] bg-white p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-[#111827]">{getGroupTitle(group)}</p>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
          group.review_status === 'reviewed' ? 'bg-[#edfcf2] text-[#027a48]' : 'bg-[#fff4e5] text-[#b25e00]'
        }`}
      >
        {getReviewStatusLabel(group.review_status)}
      </span>
    </div>

    {group.audio?.url && (
      <div className="mb-4 rounded-xl bg-[#f9fafb] p-3">
        <audio controls src={group.audio.url} className="w-full" />
        {(group.audio.transcript_en || group.audio.transcript_vi) && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-[#004ac6]">Transcript</summary>
            <div className="mt-2 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
              <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-[#344054]">{group.audio.transcript_en}</p>
              <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-[#344054]">{group.audio.transcript_vi}</p>
            </div>
          </details>
        )}
      </div>
    )}

    {group.images.length > 0 && (
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {group.images
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((image, index) => (
            <div key={`${image.media_asset_id}-${index}`} className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-2">
              {image.url ? (
                <img src={image.url} alt={image.label || 'group image'} className="max-h-80 w-full object-contain" />
              ) : (
                <div className="flex h-32 items-center justify-center text-xs font-semibold text-[#667085]">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Thiếu URL image
                </div>
              )}
            </div>
          ))}
      </div>
    )}

    {group.passages.length > 0 && (
      <div className="mb-4 space-y-3">
        {group.passages
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((passage, index) => (
            <div key={`${passage.id || passage.media_asset_id || index}`} className="rounded-xl border border-[#e4e7ec] bg-[#f9fafb] p-3">
              {passage.content_format === 'image' ? (
                <div className="space-y-2">
                  {passage.title && <h5 className="text-sm font-bold text-[#111827]">{passage.title}</h5>}
                  {passage.url ? (
                    <img src={passage.url} alt={passage.title || passage.label || 'passage'} className="max-h-[520px] w-full object-contain" />
                  ) : (
                    <p className="text-xs font-semibold text-[#667085]">Thiếu URL image của passage.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm text-[#344054]">
                  {passage.title && <h5 className="text-sm font-bold text-[#111827]">{passage.title}</h5>}
                  {passage.content_en && <p className="whitespace-pre-wrap">{passage.content_en}</p>}
                  {passage.content_vi && <p className="whitespace-pre-wrap text-[#667085]">{passage.content_vi}</p>}
                  {passage.vocab_hints && <p className="rounded-lg bg-white p-2 text-xs">{passage.vocab_hints}</p>}
                </div>
              )}
            </div>
          ))}
      </div>
    )}

    <div className="space-y-4">
      {group.questions.map((question) => (
        <div key={question.id} className="rounded-xl border border-[#e4e7ec] p-4">
          <p className="mb-2 text-xs font-bold text-[#004ac6]">Question {question.question_number}</p>
          {question.question_text_en && <p className="text-sm font-medium leading-6 text-[#111827]">{question.question_text_en}</p>}
          {question.question_text_vi && <p className="mt-1 text-xs leading-5 text-[#667085]">{question.question_text_vi}</p>}
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  answer.is_correct ? 'border-[#027a48] bg-[#edfcf2]' : 'border-[#e4e7ec] bg-white'
                }`}
              >
                <p className="font-semibold leading-5 text-[#111827]">
                  {answer.label}. {answer.answer_text_en}
                </p>
                {answer.answer_text_vi && <p className="mt-0.5 text-xs leading-4 text-[#667085]">{answer.answer_text_vi}</p>}
              </div>
            ))}
          </div>
          {question.explanation_vi && (
            <ExplanationPreview value={question.explanation_vi} />
          )}
        </div>
      ))}
    </div>
  </article>
);
