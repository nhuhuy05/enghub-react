import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenText,
  FileText,
  Languages,
  Loader2,
  Tag,
} from 'lucide-react';
import { READING_LESSON_TYPE_LABELS } from '../constants/labels';
import { useReadingSession } from '../hooks/useReadingSession';

const splitLines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

export const ReadingPracticePage = () => {
  const { lessonId = '' } = useParams<{
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const {
    lesson,
    isLoading,
    error,
    isBilingual,
    setIsBilingual,
    showVocabulary,
    setShowVocabulary,
  } = useReadingSession(lessonId);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f6f7fc]">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-[#505f76]">Đang chuẩn bị bài đọc...</p>
      </div>
    );
  }

  if (error || !lesson) {
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
    <div className="fixed inset-x-0 bottom-0 top-16 flex flex-col overflow-hidden bg-[#f6f7fc] text-[#191b23]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#d8dced] bg-white/95 px-4 lg:px-6">
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dced] text-[#526985] transition hover:border-[#004ac6] hover:text-[#004ac6]"
          aria-label="Back to reading"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {READING_LESSON_TYPE_LABELS[lesson.readingType]}
        </span>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 lg:px-5">
        <div className="mx-auto grid max-w-[1180px] gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-3">
            <div className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-[#667085]">
                    {lesson.testTitle}
                  </p>
                  <h1 className="mt-1 truncate text-xl font-black text-[#111827]">{lesson.titleVi || lesson.title}</h1>
                 
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBilingual(!isBilingual)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                      isBilingual ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-[#d8dced] bg-white text-[#526985]'
                    }`}
                  >
                    <Languages className="h-4 w-4" />
                    Song ngữ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVocabulary(!showVocabulary)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                      showVocabulary ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#d8dced] bg-white text-[#526985]'
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    Từ vựng
                  </button>
                </div>
              </div>
            </div>

            {lesson.passages.map((passage, index) => {
              const enLines = splitLines(passage.contentEn);
              const viLines = splitLines(passage.contentVi);
              return (
                <article key={passage.id} className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e4e7ec] pb-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                      <h2 className="truncate text-base font-black text-[#111827]">
                        {passage.title || `Passage ${index + 1}`}
                      </h2>
                    </div>
                    <span className="rounded-full border border-[#d8dced] bg-[#fbfcff] px-2.5 py-0.5 text-[11px] font-bold text-[#526985]">
                      {passage.passageType || passage.contentFormat || `Passage ${index + 1}`}
                    </span>
                  </div>

                  <div className="space-y-3 text-[15px] leading-7 text-[#111827]">
                    {enLines.length > 0 ? enLines.map((line, lineIndex) => (
                      <p key={`${passage.id}-${lineIndex}`}>
                        <span className="block whitespace-pre-wrap font-medium">{line}</span>
                        {isBilingual && viLines[lineIndex] && (
                          <span className="mt-0.5 block whitespace-pre-wrap text-sm font-medium leading-6 text-[#667085]">
                            {viLines[lineIndex]}
                          </span>
                        )}
                      </p>
                    )) : (
                      <p className="text-sm font-semibold text-[#98a2b3]">Passage này chưa có nội dung tiếng Anh.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="space-y-3">
            {showVocabulary && (
              <section className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-700">
                  <Tag className="h-4 w-4" />
                  Từ vựng ({lesson.vocabularyHints.length})
                </div>
                {lesson.vocabularyHints.length > 0 ? (
                  <div className="space-y-2">
                    {lesson.vocabularyHints.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[#d8dced] bg-[#fbfcff] px-3 py-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-black text-[#111827]">{item.word}</span>
                            {item.partOfSpeech && (
                              <span className="ml-2 rounded bg-[#eef2f7] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#667085]">
                                {item.partOfSpeech}
                              </span>
                            )}
                          </div>
                          {item.passageOrderIndex !== null && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              P{item.passageOrderIndex + 1}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-semibold text-[#667085]">{item.meaningVi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-[#98a2b3]">Bài này chưa có từ vựng gợi ý.</p>
                )}
              </section>
            )}

            <section className="rounded-2xl border border-[#d8dced] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#111827]">
                <BookOpenText className="h-4 w-4 text-[#004ac6]" />
                Thông tin lesson
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-[#667085]">Passages</dt>
                  <dd className="font-black text-[#111827]">{lesson.passages.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-[#667085]">Từ vựng</dt>
                  <dd className="font-black text-[#111827]">{lesson.vocabularyHints.length}</dd>
                </div>
                {lesson.difficulty && (
                  <div className="flex justify-between gap-3">
                    <dt className="font-semibold text-[#667085]">Độ khó</dt>
                    <dd className="font-black text-[#111827]">{lesson.difficulty}</dd>
                  </div>
                )}
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};
