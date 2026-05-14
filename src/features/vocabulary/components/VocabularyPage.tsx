import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenText,
  BookText,
  ClipboardList,
  GraduationCap,
  Loader2,
  Search,
  Target,
} from 'lucide-react';
import { useVocabulary } from '../hooks/useVocabulary';
import type { VocabularyCollectionType } from '../types';

type CollectionFilter = VocabularyCollectionType | 'all';

const filters: Array<{ id: CollectionFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'topic', label: 'Chủ đề' },
  { id: 'exam_set', label: 'Theo bộ đề' },
];

export const VocabularyPage = () => {
  const { topics, isLoading, error } = useVocabulary();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return topics.filter((topic) => {
      const matchesFilter = activeFilter === 'all' || topic.collectionType === activeFilter;
      const matchesSearch =
        !normalizedQuery ||
        topic.title.toLowerCase().includes(normalizedQuery) ||
        topic.description.toLowerCase().includes(normalizedQuery) ||
        topic.category.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, topics]);

  const totalWords = topics.reduce((total, topic) => total + topic.wordCount, 0);
  const topicCount = topics.filter((topic) => topic.collectionType === 'topic').length;
  const setCount = topics.filter((topic) => topic.collectionType === 'exam_set').length;

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F6F9FC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0057D9]" />
        <p className="font-bold text-[#52657A]">Đang tải từ vựng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F6F9FC] px-4 text-center">
        <h2 className="text-xl font-black text-[#EF4444]">Đã có lỗi xảy ra</h2>
        <p className="text-sm font-medium text-[#52657A]">{error}</p>
        <button onClick={() => window.location.reload()} className="rounded-xl bg-[#0057D9] px-5 py-2.5 text-sm font-black text-white">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F9FC] px-4 py-8 text-[#152033] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[#C9D8E8] bg-[#EAF2FF] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#003A91]">
              <BookText className="h-4 w-4" />
              TOEIC Vocabulary
            </div>
            <h1 className="text-[36px] font-black leading-tight tracking-tight text-[#0F2747]">Học từ vựng</h1>
            <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#52657A]">
              Xem toàn bộ từ theo chủ đề hoặc bộ đề, sau đó chuyển sang flashcard để học từng từ.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8E3EE] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F7FB] text-[#1E4E8C]">
              <Target className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-[#52657A]">Kho hiện có</p>
            <p className="mt-1 text-3xl font-black text-[#0F2747]">{totalWords} từ</p>
            <p className="mt-2 text-xs font-bold text-[#52657A]">
              {topicCount} chủ đề • {setCount} bộ đề
            </p>
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-black transition ${
                  activeFilter === filter.id
                    ? 'bg-[#003A91] text-white shadow-[0_8px_18px_rgba(15,39,71,0.16)]'
                    : 'border border-[#D8E3EE] bg-white text-[#52657A] hover:border-[#003A91] hover:text-[#003A91]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </nav>

          <div className="relative w-full lg:max-w-[360px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8EA1B5]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm chủ đề, bộ đề..."
              className="h-11 w-full rounded-xl border border-[#D8E3EE] bg-white pl-10 pr-4 text-sm font-bold text-[#152033] outline-none transition placeholder:text-[#8EA1B5] focus:border-[#0057D9] focus:ring-2 focus:ring-[#EAF2FF]"
            />
          </div>
        </section>

        {filteredTopics.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTopics.map((topic) => {
              const Icon = topic.collectionType === 'exam_set' ? ClipboardList : topic.title === 'Business' ? GraduationCap : BookOpenText;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => navigate(`/vocabulary/${topic.id}`)}
                  className="group flex min-h-[260px] flex-col rounded-2xl border border-[#D8E3EE] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1E4E8C] hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F7FB] text-[#1E4E8C]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-[11px] font-black text-[#003A91]">
                        {topic.collectionType === 'exam_set' ? 'Bộ đề' : 'Chủ đề'}
                      </span>
                      {topic.badge && (
                        <span className="rounded-lg bg-[#ECFEFF] px-2.5 py-1 text-[11px] font-black text-[#0B7991]">{topic.badge}</span>
                      )}
                    </div>
                  </div>

                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#52657A]">{topic.category}</p>
                  <h2 className="text-xl font-black text-[#0F2747]">{topic.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-[#52657A]">{topic.description}</p>

                  <div className="mt-auto pt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-black text-[#52657A]">
                      <span>
                        {topic.wordCount} từ • {topic.level}
                      </span>
                      <span>{topic.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#E8EEF6]">
                      <div className="h-full rounded-full bg-[#0057D9]" style={{ width: `${topic.progress}%` }} />
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#003A91]">
                      Xem từ vựng
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ) : (
          <section className="flex h-64 flex-col items-center justify-center rounded-2xl border border-[#D8E3EE] bg-white text-center shadow-sm">
            <Search className="mb-3 h-9 w-9 text-[#8EA1B5]" />
            <h2 className="text-lg font-black text-[#0F2747]">Không tìm thấy bộ từ phù hợp</h2>
            <p className="mt-1 text-sm font-medium text-[#52657A]">Thử đổi từ khóa hoặc bộ lọc.</p>
          </section>
        )}
      </div>
    </main>
  );
};
