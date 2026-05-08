import { Search, BookOpen, ChevronRight } from 'lucide-react';

const grammarCards = [
  {
    title: 'Basic Grammar Knowledge',
    subtitle: 'Kiến thức ngữ pháp cơ bản',
    totalLabel: '50 câu hỏi',
    progressText: '6/50 câu đã hoàn thành',
    progress: 12,
    icon: BookOpen,
    accent: false,
  },
  {
    title: 'Nouns',
    subtitle: 'Danh từ',
    totalLabel: '62 câu hỏi',
    progressText: 'Chưa bắt đầu',
    progress: 0,
    icon: BookOpen,
    accent: false,
  },
  {
    title: 'Verbs',
    subtitle: 'Động từ',
    totalLabel: '45 câu hỏi',
    progressText: '32/45 câu đã hoàn thành',
    progress: 71,
    icon: BookOpen,
    accent: false,
  },
  {
    title: 'Adjectives & Adverbs',
    subtitle: 'Tính từ & Trạng từ',
    totalLabel: '40 câu hỏi',
    progressText: '0/40 câu đã hoàn thành',
    progress: 0,
    icon: BookOpen,
    accent: false,
  },
  {
    title: 'Relative Clauses',
    subtitle: 'Mệnh đề quan hệ',
    totalLabel: '30 câu hỏi',
    progressText: '0/30 câu đã hoàn thành',
    progress: 0,
    icon: BookOpen,
    accent: false,
  },
  {
    title: 'Relative Clauses',
    subtitle: 'Mệnh đề quan hệ',
    totalLabel: '30 câu hỏi',
    progressText: '0/30 câu đã hoàn thành',
    progress: 0,
    icon: BookOpen,
    accent: false,
  },
];

export const GrammarPage = () => {
  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <section className="mb-10 text-center">
        <h1 className="mb-4 text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[#191b23]">
          Chinh phục Ngữ pháp Toeic Part 5
        </h1>
      </section>

      <div className="mb-10">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737686]" />
          <input
            className="w-full rounded-xl border border-[#c3c6d7] bg-white py-4 pl-12 pr-4 text-[16px] outline-none transition focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
            placeholder="Tìm kiếm chủ điểm ngữ pháp..."
            type="text"
          />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {grammarCards.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={`relative rounded-2xl border bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.1)] ${
                item.accent ? 'border-[#b8dcff]' : 'border-[#e3e6ef]'
              }`}
            >
              {item.accent && <div className="absolute left-4 top-0 h-1 w-16 rounded-b-full bg-[#18a0fb]" />}

              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold leading-[1.3] text-[#191b23]">{item.title}</h2>
                  <p className="mt-1 text-sm text-[#737686]">{item.subtitle}</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f6ff] text-[#4b77d1]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#4b77d1]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#4b77d1]/30 text-[11px]">◎</span>
                <span>{item.totalLabel}</span>
              </div>

              <div className="mb-4 text-sm font-medium text-[#a67c00]">{item.progressText}</div>

              <div className="flex items-center justify-between">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf0fb]">
                  <div className="h-full rounded-full bg-[#4b77d1]" style={{ width: `${item.progress}%` }} />
                </div>

                <button className="ml-4 inline-flex items-center gap-1 text-sm font-medium text-[#4b77d1] hover:underline">
                  Luyện tập <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};
