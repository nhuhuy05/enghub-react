import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useGrammar } from '../hooks/useGrammar';
import { useNavigate } from 'react-router-dom';

const categories = ['Tất cả', 'Các thì cơ bản', 'Từ loại', 'Cấu trúc câu', 'Từ vựng'];

export const GrammarPage: React.FC = () => {
  const { topics, isLoading, error } = useGrammar();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesCategory = activeCategory === 'Tất cả' || topic.category === activeCategory;
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [topics, activeCategory, searchQuery]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold text-red-500">Lỗi: {error}</h2>
        <button onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-4 py-2 text-white">Thử lại</button>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-10 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-orange-600">Hệ thống Ngữ pháp</span>
        </div>
        <p className="text-[14px] font-medium text-[#505f76] max-w-2xl">
          Nắm vững toàn bộ cấu trúc ngữ pháp trọng tâm trong bài thi TOEIC. 
          Học lý thuyết kết hợp bài tập thực hành ngay lập tức.
        </p>
      </section>

      {/* Filters & Search */}
      <section className="mb-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-100' 
                    : 'bg-white text-[#505f76] border border-[#e2e8f0] hover:border-[#004ac6] hover:text-[#004ac6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ điểm ngữ pháp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e2e8f0] bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
          <p className="font-bold text-[#505f76]">Đang tải kiến thức...</p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <article 
              key={topic.id}
              className="group relative flex flex-col rounded-3xl border border-[#e2e8f0] bg-white p-7 transition-all hover:border-[#004ac6] hover:shadow-xl hover:-translate-y-1"
            >
              {topic.isNew && (
                <div className="absolute right-6 top-6 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase text-green-600">
                  Mới
                </div>
              )}

              <div className="mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-500 mb-2 block">
                  {topic.category}
                </span>
                <h2 className="text-[22px] font-bold leading-tight text-[#191b23] group-hover:text-[#004ac6] transition-colors">
                  {topic.title}
                </h2>
              </div>

              <p className="text-[15px] leading-relaxed text-[#64748b] line-clamp-3">
                {topic.description}
              </p>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#94a3b8]">
                  <BookOpen className="h-4 w-4" />
                  <span>{topic.lessonsCount} bài học</span>
                </div>
                
                <button 
                  onClick={() => navigate(`/grammar/${topic.id}`)}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#004ac6] group/btn transition-all hover:gap-2.5"
                >
                  Bắt đầu học
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};
