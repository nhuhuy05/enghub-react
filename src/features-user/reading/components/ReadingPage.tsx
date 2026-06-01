import { useNavigate } from 'react-router-dom';
import { BookOpenText, ChevronRight, Loader2, RotateCcw, Search } from 'lucide-react';
import { READING_LESSON_TYPE_LABELS } from '../constants/labels';
import { useReading } from '../hooks/useReading';

export const ReadingPage = () => {
  const navigate = useNavigate();
  const {
    filteredLessons,
    readingTypes,
    activeReadingType,
    setActiveReadingType,
    isLoading,
    error,
  } = useReading();

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-4">
          <BookOpenText className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Đã có lỗi xảy ra</h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#004ac6] px-6 py-2 font-bold text-white shadow-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f6f7fc] px-4 py-6 pb-16 text-[#191b23] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpenText className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-emerald-600">
              TOEIC Reading
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#667085]">
            Chọn bài đọc Part 7 đã publish, luyện đọc song ngữ và xem từ vựng gợi ý theo từng lesson.
          </p>
        </section>

        <section className="mb-8">
          <nav className="flex gap-2 overflow-x-auto pb-2">
            {readingTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveReadingType(type)}
                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  activeReadingType === type
                    ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-100'
                    : 'border border-[#d8dced] bg-white text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6]'
                }`}
              >
                {type === 'All' ? 'Tất cả' : READING_LESSON_TYPE_LABELS[type]}
              </button>
            ))}
          </nav>
        </section>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
            <p className="font-bold text-[#505f76]">Đang tải bài đọc...</p>
          </div>
        ) : filteredLessons.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => navigate(`/reading/${lesson.id}`)}
                className="group flex min-h-[240px] flex-col rounded-2xl border border-[#d8dced] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#004ac6] hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {READING_LESSON_TYPE_LABELS[lesson.readingType]}
                    </span>
                    {lesson.difficulty && (
                      <span className="rounded-xl bg-[#f2f4f7] px-3 py-1 text-xs font-black text-[#667085]">
                        {lesson.difficulty}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#98a2b3] transition group-hover:translate-x-1 group-hover:text-[#004ac6]" />
                </div>
                <h3 className="text-lg font-black text-[#111827]">{lesson.titleVi}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#667085]">
                  {lesson.testTitle} • Group {lesson.groupOrder}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <span className="inline-flex rounded-xl border border-[#d8dced] bg-[#fbfcff] px-3 py-1.5 text-xs font-black text-[#526985]">
                    {lesson.passageCount} passage
                  </span>
                  <span className="inline-flex rounded-xl border border-[#d8dced] bg-[#fbfcff] px-3 py-1.5 text-xs font-black text-[#526985]">
                    {lesson.vocabularyCount} từ vựng
                  </span>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Không có bài đọc phù hợp</h3>
            <p className="text-sm text-[#667085]">Hãy chọn loại bài khác hoặc quay lại sau.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="fixed bottom-6 right-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white text-[#64748b] shadow-xl transition hover:text-[#004ac6] lg:flex"
          aria-label="Refresh reading data"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
};
