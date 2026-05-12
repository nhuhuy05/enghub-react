import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Languages,
  Loader2,
  Tag,
  XCircle,
} from 'lucide-react';
import { READING_DOCUMENT_TYPE_LABELS } from '../constants/labels';
import { useReadingSession } from '../hooks/useReadingSession';
import type { ReadingAnswerOption, ReadingQuestion } from '../types';

const getOptionClass = (question: ReadingQuestion, selectedAnswer?: ReadingAnswerOption['id']) => {
  if (!selectedAnswer) return 'border-[#dbe3ef] bg-white hover:border-[#004ac6] hover:bg-[#f8fbff]';
  if (selectedAnswer === question.correctAnswer) return 'border-emerald-300 bg-emerald-50 text-emerald-800';
  return 'border-red-300 bg-red-50 text-red-800';
};

export const ReadingPracticePage = () => {
  const { passageId = 'company-lunch-email' } = useParams<{
    passageId: string;
  }>();
  const navigate = useNavigate();
  const {
    passage,
    isLoading,
    error,
    selectedAnswers,
    isBilingual,
    setIsBilingual,
    showVocabulary,
    setShowVocabulary,
    selectAnswer,
  } = useReadingSession(passageId);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-[#505f76]">Đang chuẩn bị bài đọc...</p>
      </div>
    );
  }

  if (error || !passage) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-500">{error || 'Không tìm thấy bài đọc'}</h2>
        <button onClick={() => navigate('/reading')} className="rounded-xl bg-[#004ac6] px-6 py-2 font-bold text-white">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-20 flex flex-col overflow-hidden bg-[#f6f8fb] text-[#0f172a]">
      <header className="flex h-12 shrink-0 items-center border-b border-[#dbe3ef] bg-white/95 px-4 lg:px-6">
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe3ef] text-[#526985] hover:border-[#004ac6] hover:text-[#004ac6]"
          aria-label="Back to reading"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <main className="grid h-full min-h-0 grid-cols-1 overflow-y-auto xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] xl:overflow-hidden">
          <section className="min-h-0 border-r border-[#dbe3ef] px-3 py-3 lg:px-5 xl:overflow-y-auto">
            <div className="space-y-3">
              <div className="rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-[#9c88b8]" />
                    <h2 className="truncate text-base font-black">{passage.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBilingual(!isBilingual)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                        isBilingual ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-[#dbe3ef] bg-white text-[#526985]'
                      }`}
                    >
                      <Languages className="h-4 w-4" />
                      Song ngữ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVocabulary(!showVocabulary)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                        showVocabulary ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#dbe3ef] bg-white text-[#526985]'
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                      Từ vựng
                    </button>
                  </div>
                </div>
              </div>

              {passage.sections.map((section, index) => (
                <article key={section.id} className="rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-end gap-2 border-b border-[#e5edf6] pb-2.5">
                    <span className="rounded-full border border-[#dbe3ef] bg-[#f8fafc] px-2.5 py-0.5 text-[11px] font-bold text-[#526985]">
                      {READING_DOCUMENT_TYPE_LABELS[section.documentType] || `Passage ${index + 1}`}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-[15px] leading-6">
                    {section.lines.map((line) => (
                      <p key={line.id}>
                        <span className="block">{line.text}</span>
                        {isBilingual && (
                          <span className="mt-0.5 block text-sm font-medium leading-5 text-[#64748b]">{line.translation}</span>
                        )}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {showVocabulary && (
              <section className="mt-3 rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
                <div className="mb-2.5 flex items-center gap-2 text-sm font-black text-emerald-700">
                  <Tag className="h-4 w-4" />
                  Từ vựng ({passage.vocabulary.length})
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {passage.vocabulary.map((item) => (
                    <div key={item.term} className="rounded-lg border border-[#dbe3ef] bg-[#fbfcff] px-2.5 py-1.5 text-sm">
                      <span className="font-black">{item.term}</span>
                      <span className="text-[#64748b]"> - {item.meaning}</span>
                      {item.example && <p className="mt-0.5 text-xs text-[#94a3b8]">{item.example}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>

          <section className="min-h-0 px-3 py-3 lg:px-5 xl:overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                ?
              </span>
              <h2 className="text-base font-black">Câu hỏi ({passage.questions.length})</h2>
            </div>

            <div className="space-y-3">
              {passage.questions.map((question) => {
                const selectedAnswer = selectedAnswers[question.id];
                const hasSelectedAnswer = Boolean(selectedAnswer);
                const isCorrect = selectedAnswer === question.correctAnswer;
                return (
                  <article key={question.id} className="rounded-xl border border-[#dbe3ef] bg-white p-3.5 shadow-sm">
                    <h3 className="text-sm font-black leading-5">
                      Q{question.number}. {question.prompt}
                    </h3>
                    {isBilingual && <p className="mt-1 text-xs font-medium text-[#64748b]">{question.translation}</p>}

                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => {
                        const isSelected = selectedAnswer === option.id;
                        const shouldShowCorrect = hasSelectedAnswer && option.id === question.correctAnswer;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => selectAnswer(question.id, option.id)}
                            disabled={hasSelectedAnswer}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
                              shouldShowCorrect
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : isSelected
                                  ? getOptionClass(question, selectedAnswer)
                                  : 'border-[#dbe3ef] bg-[#fbfcff] hover:border-[#004ac6] hover:bg-white'
                            } disabled:cursor-default`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dbe3ef] bg-white text-xs font-black">
                              {option.id}
                            </span>
                            <span>{option.text}</span>
                            {shouldShowCorrect && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
                            {isSelected && !isCorrect && <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer && (
                      <div className={`mt-3 rounded-lg border p-3 ${
                        isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <p className={`flex items-center gap-2 text-sm font-black ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {isCorrect ? 'Chính xác' : `Chưa đúng. Đáp án đúng là ${question.correctAnswer}`}
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-[#334155]">{question.explanation}</p>
                        <p className="mt-1 text-xs leading-5 text-[#64748b]">{question.explanationVi}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>

    </div>
  );
};
