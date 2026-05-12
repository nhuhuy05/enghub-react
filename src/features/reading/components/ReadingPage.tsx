import { useNavigate } from 'react-router-dom';
import { BookOpenText, ChevronRight, Loader2, RotateCcw, Search } from 'lucide-react';
import { formatReadingDocumentTypes, READING_PASSAGE_GROUP_LABELS } from '../constants/labels';
import { useReading } from '../hooks/useReading';

export const ReadingPage = () => {
  const navigate = useNavigate();
  const {
    filteredPassages,
    passageGroups,
    activePassageGroup,
    setActivePassageGroup,
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
    <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 pb-16 sm:px-6 lg:px-8">
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <BookOpenText className="h-5 w-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-emerald-600">
            TOEIC Reading
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#505f76]">
          Chọn từng bài đọc Part 7 riêng lẻ, luyện song ngữ, xem gợi ý từ vựng và giải thích đáp án ngay sau khi chọn.
        </p>
      </section>

      <section className="mb-8">
        <nav className="flex gap-2 overflow-x-auto pb-2">
          {passageGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setActivePassageGroup(group)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activePassageGroup === group
                  ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-100'
                  : 'border border-[#e2e8f0] bg-white text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6]'
              }`}
            >
              {group === 'All' ? 'Tất cả' : READING_PASSAGE_GROUP_LABELS[group]}
            </button>
          ))}
        </nav>
      </section>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
          <p className="font-bold text-[#505f76]">Đang tải bài đọc...</p>
        </div>
      ) : filteredPassages.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPassages.map((passage) => (
            <button
              key={passage.id}
              type="button"
              onClick={() => navigate(`/reading/${passage.id}`)}
              className="group flex min-h-[240px] flex-col rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#004ac6] hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {READING_PASSAGE_GROUP_LABELS[passage.passageGroup]}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#94a3b8] transition group-hover:translate-x-1 group-hover:text-[#004ac6]" />
              </div>
              <h3 className="text-lg font-black text-[#191b23]">{passage.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#64748b]">{passage.description}</p>
              <div className="mt-auto pt-5">
                <span className="inline-flex rounded-xl border border-[#dbe3ef] bg-[#f8fafc] px-3 py-1.5 text-xs font-black text-[#526985]">
                  {formatReadingDocumentTypes(passage.documentTypes)}
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
          <h3 className="text-lg font-bold text-[#191b23]">Không có bài đọc phù hợp</h3>
          <p className="text-sm text-[#64748b]">Hãy chọn bộ đề khác hoặc quay lại sau.</p>
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
    </main>
  );
};
