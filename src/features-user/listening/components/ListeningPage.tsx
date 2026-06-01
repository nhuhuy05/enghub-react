import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Headphones,
  Loader2,
  RotateCcw,
  Search,
  Waves,
} from 'lucide-react';
import { useListening } from '../hooks/useListening';

const statusLabel = {
  not_started: 'Chưa bắt đầu',
  in_progress: 'Đang luyện',
  completed: 'Hoàn thành',
};

export const ListeningPage = () => {
  const navigate = useNavigate();
  const {
    filteredTests,
    collections,
    activeCollection,
    setActiveCollection,
    isLoading,
    error,
  } = useListening();

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-4">
          <Headphones className="h-10 w-10 text-red-400" />
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
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <Waves className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-cyan-600">
              TOEIC Listening
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#505f76]">
            Chọn bộ đề, luyện từng Part với các chế độ Nghe Check, Nghe Chép và Nghe Full transcript.
          </p>
        </div>

      </section>

      <section className="mb-8 space-y-5">
        <nav className="flex gap-2 overflow-x-auto pb-2">
          {collections.map((collection) => (
            <button
              key={collection}
              onClick={() => setActiveCollection(collection)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeCollection === collection
                  ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-100'
                  : 'border border-[#e2e8f0] bg-white text-[#505f76] hover:border-[#004ac6] hover:text-[#004ac6]'
              }`}
            >
              {collection === 'All' ? 'Tất cả' : collection}
            </button>
          ))}
        </nav>
      </section>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
          <p className="font-bold text-[#505f76]">Đang tải bài nghe...</p>
        </div>
      ) : filteredTests.length > 0 ? (
        <section className="space-y-8">
          {filteredTests.map((test) => (
            <article key={test.id} className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                
                <h2 className="text-2xl font-black text-[#191b23]">{test.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-cyan-50 px-3 py-1 text-[11px] font-black uppercase text-cyan-600">
                    {test.collection}
                  </span>
                  {test.isNew && (
                    <span className="rounded-lg bg-red-50 px-3 py-1 text-[11px] font-black uppercase text-red-500">
                      Mới
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {test.parts.map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => navigate(`/listening/${test.id}/${part.id}`)}
                    className="group flex min-h-[190px] flex-col rounded-2xl border border-[#e2e8f0] bg-[#fbfcff] p-5 text-left transition-all hover:-translate-y-1 hover:border-[#004ac6] hover:bg-white hover:shadow-xl"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-xl bg-[#004ac6] px-3 py-1 text-xs font-black text-white">
                        {part.name}
                      </span>
                      <ChevronRight className="h-5 w-5 text-[#94a3b8] transition group-hover:translate-x-1 group-hover:text-[#004ac6]" />
                    </div>
                    <h3 className="text-lg font-black text-[#191b23]">{part.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748b]">{part.description}</p>
                    <div className="mt-auto pt-5">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#94a3b8]">
                        <span>{statusLabel[part.status]}</span>
                        <span>{Math.round((part.progress / 100) * part.questionsCount)}/{part.questionsCount} câu</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${part.progress}%` }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#191b23]">Không có bài nghe phù hợp</h3>
          <p className="text-sm text-[#64748b]">Hãy chọn bộ đề khác hoặc quay lại sau.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="fixed bottom-6 right-6 hidden h-12 w-12 items-center justify-center rounded-full bg-white text-[#64748b] shadow-xl transition hover:text-[#004ac6] lg:flex"
        aria-label="Refresh listening data"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
    </main>
  );
};
