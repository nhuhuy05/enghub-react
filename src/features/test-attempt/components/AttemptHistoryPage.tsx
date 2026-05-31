import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getErrorMessage, testAttemptService } from '../services/testAttemptService';
import type { AttemptStatus, AttemptSummary, PageResult } from '../types';

const PAGE_SIZE = 20;

const formatParts = (parts: number[]) => (parts.length ? parts.join(', ') : '1-7');

export const AttemptHistoryPage = () => {
  const [status, setStatus] = useState<AttemptStatus>('IN_PROGRESS');
  const [pageNumber, setPageNumber] = useState(0);
  const [page, setPage] = useState<PageResult<AttemptSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const nextPage = await testAttemptService.getAttempts({ status, page: pageNumber, size: PAGE_SIZE });
        setPage(nextPage);
      } catch (err) {
        setErrorMsg(getErrorMessage(err, 'Không thể tải lịch sử làm bài.'));
      } finally {
        setLoading(false);
      }
    };

    void loadAttempts();
  }, [pageNumber, status]);

  const changeStatus = (nextStatus: AttemptStatus) => {
    setStatus(nextStatus);
    setPageNumber(0);
  };

  return (
    <main className="min-h-screen bg-[#f6f7fc] px-4 py-8 pt-28 text-[#191b23] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">Lịch sử làm bài</h1>
            <p className="mt-2 text-sm font-medium text-[#667085]">Tiếp tục bài đang làm hoặc xem lại kết quả đã nộp.</p>
          </div>
          <Link to="/tests" className="text-sm font-bold text-[#004ac6] hover:underline">
            Xem danh sách đề
          </Link>
        </div>

        <div className="inline-flex rounded-xl border border-[#d8dced] bg-white p-1">
          {(['IN_PROGRESS', 'SUBMITTED'] as AttemptStatus[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeStatus(item)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                status === item ? 'bg-[#004ac6] text-white' : 'text-[#667085] hover:bg-[#f3f5fb]'
              }`}
            >
              {item === 'IN_PROGRESS' ? 'Đang làm' : 'Đã nộp'}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-[#fee4e2] bg-[#fef3f2] p-4 text-sm font-bold text-[#b42318]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#004ac6]" />
            <p className="mt-3 text-sm font-bold text-[#667085]">Đang tải lịch sử...</p>
          </div>
        ) : !page || page.content.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8dced] bg-white p-12 text-center">
            <h2 className="text-base font-bold text-[#111827]">Chưa có lượt làm bài</h2>
            <p className="mt-1 text-sm text-[#667085]">Hãy chọn một đề để bắt đầu lượt làm bài đầu tiên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {page.content.map((attempt) => (
              <AttemptCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}

        {page && page.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-[#d8dced] bg-white p-3">
            <p className="text-xs font-bold text-[#667085]">
              Trang {page.number + 1}/{page.totalPages} | {page.totalElements} lượt làm bài
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPageNumber((value) => Math.max(0, value - 1))}
                disabled={page.number <= 0}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold text-[#344054] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Trước
              </button>
              <button
                type="button"
                onClick={() => setPageNumber((value) => Math.min(page.totalPages - 1, value + 1))}
                disabled={page.number >= page.totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d8dced] px-3 py-2 text-xs font-bold text-[#344054] disabled:opacity-40"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const AttemptCard = ({ attempt }: { attempt: AttemptSummary }) => {
  const isSubmitted = attempt.status === 'SUBMITTED';
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-[#111827]">{attempt.testTitle || `Test #${attempt.testId}`}</p>
        <p className="mt-1 text-xs font-bold uppercase text-[#004ac6]">
          {attempt.mode} | Part {formatParts(attempt.partNumbers)}
        </p>
        <p className="mt-2 text-sm text-[#667085]">
          {attempt.answeredCount}/{attempt.totalQuestions} câu đã làm
          {attempt.remainingSeconds !== null && !isSubmitted ? ` | còn ${attempt.remainingSeconds}s` : ''}
          {attempt.totalScore !== null ? ` | Điểm ${attempt.totalScore}` : ''}
        </p>
      </div>
      <Link
        to={isSubmitted ? `/attempts/${attempt.id}/result` : `/attempts/${attempt.id}`}
        className={`inline-flex shrink-0 justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition ${
          isSubmitted ? 'border border-[#004ac6] text-[#004ac6] hover:bg-[#eaf0ff]' : 'bg-[#004ac6] text-white hover:bg-[#003da3]'
        }`}
      >
        {isSubmitted ? 'Xem kết quả' : 'Tiếp tục'}
      </Link>
    </article>
  );
};
