import { AlertTriangle, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { PreviewResult } from '../../types/adminTestTypes';

interface ValidationPanelProps {
  validation: PreviewResult;
  onRefresh: () => void;
  onFixReview: () => void;
}

export const ValidationPanel = ({ validation, onRefresh, onFixReview }: ValidationPanelProps) => {
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
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {!validation.publishable && (
            <button
              onClick={onFixReview}
              className="rounded-lg border border-white/70 bg-white px-3 py-1.5 text-xs font-bold text-[#b42318]"
            >
              Sửa Review nhóm câu
            </button>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded-lg border border-white/70 bg-white px-3 py-1.5 text-xs font-bold text-[#344054]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>
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
