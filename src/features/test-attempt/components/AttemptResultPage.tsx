import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getErrorCode, getErrorMessage, testAttemptService } from '../services/testAttemptService';
import type { AttemptGroup, AttemptQuestion, AttemptResult } from '../types';
import { AudioRangePlayer } from './AudioRangePlayer';

const formatParts = (parts: number[]) => (parts.length ? parts.join(', ') : '1-7');

const formatDuration = (seconds: number | null) => {
  if (seconds === null) return '-';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} phút ${rest} giây`;
};

export const AttemptResultPage = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const numericAttemptId = Number(attemptId);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [invalidState, setInvalidState] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      if (!Number.isFinite(numericAttemptId)) {
        setErrorMsg('Mã lượt làm bài không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');
        setInvalidState(false);
        const nextResult = await testAttemptService.getAttemptResult(numericAttemptId);
        setResult(nextResult);
      } catch (err) {
        if (getErrorCode(err) === 1013) {
          setInvalidState(true);
        }
        setErrorMsg(getErrorMessage(err, 'Không thể tải kết quả làm bài.'));
      } finally {
        setLoading(false);
      }
    };

    void loadResult();
  }, [numericAttemptId]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7fc] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#004ac6]" />
        <p className="text-sm font-bold text-[#667085]">Đang tải kết quả...</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-[#f6f7fc] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#fee4e2] bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#d92d20]" />
          <h1 className="mt-3 text-xl font-bold text-[#111827]">Không thể tải kết quả</h1>
          <p className="mt-2 text-sm text-[#667085]">{errorMsg}</p>
          <div className="mt-5 flex justify-center gap-3">
            {invalidState && Number.isFinite(numericAttemptId) && (
              <Link to={`/attempts/${numericAttemptId}`} className="rounded-xl bg-[#004ac6] px-4 py-2.5 text-sm font-bold text-white">
                Quay lại bài làm
              </Link>
            )}
            <Link to="/attempts" className="rounded-xl border border-[#d8dced] px-4 py-2.5 text-sm font-bold text-[#344054]">
              Lịch sử làm bài
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const partialAttempt = result.attempt.partNumbers.length > 0 && result.attempt.partNumbers.length < 7;

  return (
    <main className="min-h-screen bg-[#f6f7fc] px-4 py-8 text-[#191b23] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[#004ac6]">
              {result.attempt.mode} | Parts {formatParts(result.attempt.partNumbers)}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-[#111827]">Kết quả làm bài</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/attempts" className="rounded-xl border border-[#d8dced] bg-white px-4 py-2.5 text-sm font-bold text-[#344054]">
              Lịch sử
            </Link>
            <Link to="/tests" className="rounded-xl bg-[#004ac6] px-4 py-2.5 text-sm font-bold text-white">
              Xem danh sách đề
            </Link>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Tổng điểm" value={result.attempt.totalScore ?? '-'} />
          <Metric label="Listening" value={result.attempt.listeningScore ?? '-'} />
          <Metric label="Reading" value={result.attempt.readingScore ?? '-'} />
          <Metric label="Số câu đúng" value={`${result.attempt.correctCount}/${result.attempt.totalQuestions}`} />
          <Metric label="Đã làm" value={`${result.attempt.answeredCount}/${result.attempt.totalQuestions}`} />
          <Metric label="Thời gian" value={formatDuration(result.attempt.durationSeconds)} />
        </section>

        {partialAttempt && (
          <div className="rounded-xl border border-[#fedf89] bg-[#fffaeb] p-4 text-sm font-semibold text-[#b25e00]">
            Điểm được quy đổi theo các Part đã chọn trong lượt làm bài này.
          </div>
        )}

        <section className="space-y-6">
          {result.parts.map((part) => (
            <div key={part.partNumber} className="rounded-2xl border border-[#d8dced] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827]">
                Part {part.partNumber}: {part.title}
              </h2>
              <div className="mt-5 space-y-6">
                {part.groups.map((group) => (
                  <ResultGroup key={group.id} group={group} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
    <p className="text-xs font-bold uppercase text-[#667085]">{label}</p>
    <p className="mt-1 text-2xl font-extrabold text-[#111827]">{value}</p>
  </div>
);

const ResultGroup = ({ group }: { group: AttemptGroup }) => (
  <article className="space-y-4 rounded-xl border border-[#e4e7ec] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-[#111827]">Nhóm {group.groupOrder}</p>
      {(group.transcriptEn || group.transcriptVi) && (
        <span className="rounded-full bg-[#eaf0ff] px-2 py-1 text-xs font-bold text-[#004ac6]">Có transcript</span>
      )}
    </div>

    {group.images.length > 0 && (
      <div className="grid gap-3 md:grid-cols-2">
        {group.images.map((image) =>
          image.url ? (
            <img
              key={`${image.id}-${image.orderIndex ?? 0}`}
              src={image.url}
              alt={image.label || 'Question image'}
              className="max-h-[360px] w-full rounded-xl border border-[#d8dced] object-contain"
            />
          ) : null
        )}
      </div>
    )}

    {group.audio && <AudioRangePlayer audio={group.audio} />}

    {(group.transcriptEn || group.transcriptVi) && (
      <div className="grid gap-3 md:grid-cols-2">
        {group.transcriptEn && (
          <div className="rounded-xl border border-[#d8dced] bg-[#f9fafb] p-3">
            <p className="mb-2 text-xs font-bold uppercase text-[#667085]">Transcript EN</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">{group.transcriptEn}</p>
          </div>
        )}
        {group.transcriptVi && (
          <div className="rounded-xl border border-[#d8dced] bg-[#f9fafb] p-3">
            <p className="mb-2 text-xs font-bold uppercase text-[#667085]">Transcript VI</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#344054]">{group.transcriptVi}</p>
          </div>
        )}
      </div>
    )}

    {group.passages.length > 0 && (
      <div className="space-y-3">
        {group.passages.map((passage, index) => (
          <div key={`${passage.id ?? index}-${passage.orderIndex ?? index}`} className="rounded-xl border border-[#d8dced] p-4">
            {passage.title && <h3 className="mb-2 text-sm font-bold text-[#111827]">{passage.title}</h3>}
            {passage.url && <img src={passage.url} alt={passage.title || 'Passage'} className="mb-3 max-h-[420px] w-full object-contain" />}
            {passage.contentEn && <p className="whitespace-pre-wrap text-sm leading-7 text-[#344054]">{passage.contentEn}</p>}
            {passage.contentVi && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#667085]">{passage.contentVi}</p>}
          </div>
        ))}
      </div>
    )}

    <div className="space-y-4">
      {group.questions.map((question) => (
        <ResultQuestion key={question.id} question={question} />
      ))}
    </div>
  </article>
);

const ResultQuestion = ({ question }: { question: AttemptQuestion }) => {
  const unanswered = question.selectedAnswerId === null;
  const correct = question.correct === true;
  return (
    <section
      className={`rounded-xl border p-4 ${
        unanswered
          ? 'border-[#d8dced] bg-[#f9fafb]'
          : correct
            ? 'border-[#d3f5d5] bg-[#edfcf2]'
            : 'border-[#fee4e2] bg-[#fef3f2]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#111827]">Câu {question.questionNumber}</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            unanswered ? 'bg-white text-[#667085]' : correct ? 'bg-white text-[#027a48]' : 'bg-white text-[#b42318]'
          }`}
        >
          {correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {unanswered ? 'Chưa trả lời' : correct ? 'Đúng' : 'Sai'}
        </span>
      </div>
      {question.questionTextEn && (
        <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-[#111827]">{question.questionTextEn}</p>
      )}
      <div className="mt-4 grid gap-2">
        {question.answers.map((answer) => {
          const selected = answer.id === question.selectedAnswerId;
          const isCorrectAnswer = answer.id === question.correctAnswerId || answer.isCorrect;
          return (
            <div
              key={answer.id}
              className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                isCorrectAnswer
                  ? 'border-[#12b76a] bg-white'
                  : selected
                    ? 'border-[#d92d20] bg-white'
                    : 'border-[#d8dced] bg-white/70'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-black">
                {answer.label}
              </span>
              <div>
                <p className="font-semibold text-[#344054]">{answer.answerTextEn || answer.answerTextVi || answer.label}</p>
                <p className="mt-1 text-xs font-bold text-[#667085]">
                  {selected ? 'Đã chọn ' : ''}
                  {isCorrectAnswer ? 'Đáp án đúng' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {question.explanationVi && (
        <div className="mt-4 rounded-xl border border-[#d8dced] bg-white p-3">
          <p className="text-xs font-bold uppercase text-[#667085]">Giải thích</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#344054]">{question.explanationVi}</p>
        </div>
      )}
    </section>
  );
};
