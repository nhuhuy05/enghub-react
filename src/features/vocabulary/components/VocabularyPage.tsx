import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Flame, 
  GraduationCap, 
  Headphones, 
  NotebookPen, 
  Sparkles, 
  BookOpenText,
  Loader2
} from 'lucide-react';
import { useVocabulary } from '../hooks/useVocabulary';

export const VocabularyPage = () => {
  const { topics, isLoading, error } = useVocabulary();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#faf8ff]">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-[#505f76]">Đang tải từ vựng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center gap-4 bg-[#faf8ff]">
        <h2 className="text-xl font-bold text-red-500">Lỗi: {error}</h2>
        <button onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-4 py-2 text-white">Thử lại</button>
      </div>
    );
  }

  const topicCards = topics.filter(t => t.category === 'Chủ đề phổ biến');
  const etsCards = topics.filter(t => t.category === 'Theo bộ đề ETS');

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#191b23]">
      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <section className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[#191b23]">Học từ vựng</h1>
            <p className="text-[18px] leading-[1.6] text-[#434655]">
              Trau dồi vốn từ theo chủ đề và cấu trúc đề thi TOEIC mới nhất.
            </p>
          </div>

          <div className="rounded-xl border border-[#c3c6d7] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#ffdbcd] p-2 text-[#7d2d00]">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.02em] text-[#505f76]">Mục tiêu hàng ngày</p>
                <div className="mt-1 text-[15px] font-semibold leading-[1.3] text-[#191b23]">45 / 50 từ</div>
            </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-[#191b23]">Chủ đề phổ biến</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-[#004ac6] hover:underline">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
            <div className="flex w-max gap-4">
              {topicCards.map((item) => {
                const Icon = item.title === 'Business' ? GraduationCap : Sparkles;
                return (
                  <article 
                    key={item.id} 
                    onClick={() => navigate(`/vocabulary/${item.id}`)}
                    className="group w-[224px] shrink-0 cursor-pointer rounded-2xl border border-[#c3c6d7] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#004ac6] hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.iconBg || 'bg-[#dbe1ff]'}`}>
                        <Icon className={`h-3.5 w-3.5 ${item.iconColor || 'text-[#003ea8]'}`} />
                      </div>
                      {item.badge && (
                        <span className="rounded-md bg-[#e7e7f3] px-2 py-1 text-[10px] font-medium text-[#505f76]">{item.badge}</span>
                      )}
                    </div>
                    <h3 className="mb-1 text-[16px] font-semibold leading-[1.35] text-[#191b23]">{item.title}</h3>
                    <p className="mb-3 text-xs text-[#505f76] line-clamp-2">{item.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-[#505f76]">
                        <span>Tiến độ</span>
                        <span className="font-semibold text-[#004ac6]">{item.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e7e7f3]">
                        <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-[24px] font-semibold leading-[1.4] text-[#191b23]">Theo bộ đề ETS</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {etsCards.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(`/vocabulary/${item.id}`)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg ${item.featured ? 'bg-[#004ac6] text-white' : 'border border-[#c3c6d7] bg-[#ededf9] text-[#191b23]'}`}
              >
                <div className="relative z-10 min-h-[216px]">
                  <h3 className={`mb-2 text-[20px] font-semibold leading-[1.35] ${item.featured ? 'text-white' : 'text-[#191b23]'}`}>{item.title}</h3>
                  <p className={`mb-5 text-[14px] leading-[1.5] ${item.featured ? 'text-white/90' : 'text-[#434655]'}`}>{item.description}</p>

                  <div className="mb-6 flex items-center gap-5">
                    <div>
                      <p className="text-[20px] font-semibold leading-[1.3]">{item.wordCount}+</p>
                      <p className={`text-[10px] uppercase tracking-[0.02em] ${item.featured ? 'text-white/80' : 'text-[#505f76]'}`}>Từ vựng</p>
                    </div>
                    <div className={`h-8 w-px ${item.featured ? 'bg-white/20' : 'bg-[#c3c6d7]'}`} />
                    <div>
                      <p className="text-[20px] font-semibold leading-[1.3]">{item.sets || '0'}</p>
                      <p className={`text-[10px] uppercase tracking-[0.02em] ${item.featured ? 'text-white/80' : 'text-[#505f76]'}`}>Bộ đề</p>
                    </div>
                  </div>

                  {item.featured ? (
                    <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#004ac6] transition group-hover:bg-[#dbe1ff]">
                      Bắt đầu học ngay
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#505f76]">
                        <span>Đã hoàn thành {item.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/60">
                        <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${item.progress}%` }} />
                      </div>
                      <button className="text-sm font-bold text-[#004ac6] hover:underline">Tiếp tục học</button>
                    </div>
                  )}
                </div>

                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
                  <BookOpenText className={`h-[112px] w-[112px] transition-transform group-hover:scale-110 ${item.featured ? 'text-white/20' : 'text-[#004ac6]/10'}`} />
                </div>
              </article>
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
};
