import { ArrowRight, Flame, GraduationCap, Headphones, NotebookPen, Sparkles, BookOpenText } from 'lucide-react';

const topicCards = [
  {
    title: 'Business',
    description: '500 từ vựng chuyên ngành',
    progress: 65,
    icon: GraduationCap,
    badge: 'Mới',
    iconBg: 'bg-[#dbe1ff]',
    iconColor: 'text-[#003ea8]',
  },
  {
    title: 'Travel',
    description: '320 từ vựng du lịch',
    progress: 40,
    icon: Sparkles,
    iconBg: 'bg-[#ffdbcd]',
    iconColor: 'text-[#7d2d00]',
  },
  {
    title: 'Office',
    description: '450 từ vựng công sở',
    progress: 12,
    icon: NotebookPen,
    iconBg: 'bg-[#d3e4fe]',
    iconColor: 'text-[#0b1c30]',
  },
  {
    title: 'Entertainment',
    description: '280 từ vựng giải trí',
    progress: 85,
    icon: Headphones,
    iconBg: 'bg-[#dbe1ff]',
    iconColor: 'text-[#003ea8]',
  },
  {
    title: 'Health',
    description: '260 từ vựng về sức khỏe',
    progress: 58,
    icon: Headphones,
    iconBg: 'bg-[#dbe1ff]',
    iconColor: 'text-[#003ea8]',
  },
  {
    title: 'Technology',
    description: '340 từ vựng về công nghệ',
    progress: 22,
    icon: NotebookPen,
    iconBg: 'bg-[#d3e4fe]',
    iconColor: 'text-[#0b1c30]',
  },
  {
    title: 'Education',
    description: '300 từ vựng học thuật',
    progress: 73,
    icon: GraduationCap,
    iconBg: 'bg-[#dbe1ff]',
    iconColor: 'text-[#003ea8]',
  },
];

const etsCards = [
  {
    title: 'ETS 2024 Series',
    description: 'Trọn bộ từ vựng xuất hiện trong 10 đề thi thật mới nhất của ETS 2024.',
    words: '850+',
    sets: '10',
    cta: 'Bắt đầu học ngay',
    featured: true,
  },
  {
    title: 'ETS 2023 Series',
    description: 'Tập hợp từ vựng trọng tâm từ các đề thi ETS 2023 phổ biến.',
    words: '720',
    sets: '05',
    cta: 'Tiếp tục học',
    featured: false,
    progress: 30,
  },
  {
    title: 'ETS 2022 Series',
    description: 'Từ vựng nền tảng từ các đề thi ETS 2022 theo chủ đề thường gặp.',
    words: '680',
    sets: '05',
    cta: 'Học tiếp',
    featured: false,
    progress: 50,
  },
  {
    title: 'ETS 2021 Series',
    description: 'Bộ từ vựng trọng tâm giúp ôn tập nhanh các câu xuất hiện lặp lại.',
    words: '640',
    sets: '04',
    cta: 'Ôn ngay',
    featured: false,
    progress: 18,
  },
  {
    title: 'ETS Mini Test',
    description: 'Bộ đề ngắn để luyện từ vựng nhanh trong 15 phút mỗi ngày.',
    words: '120',
    sets: '12',
    cta: 'Luyện nhanh',
    featured: false,
    progress: 76,
  },
  {
    title: 'Advanced ETS',
    description: 'Từ vựng nâng cao dành cho mục tiêu 800+ và 900+ TOEIC.',
    words: '500+',
    sets: '08',
    cta: 'Khám phá',
    featured: false,
    progress: 44,
  },
];

export const VocabularyPage = () => {
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

          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex w-max gap-4">
              {topicCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="group w-[224px] shrink-0 rounded-2xl border border-[#c3c6d7] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#004ac6] hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.iconBg}`}>
                        <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                      </div>
                      <span className="rounded-md bg-[#e7e7f3] px-2 py-1 text-[10px] font-medium text-[#505f76]">{item.badge}</span>
                    </div>
                    <h3 className="mb-1 text-[16px] font-semibold leading-[1.35] text-[#191b23]">{item.title}</h3>
                    <p className="mb-3 text-xs text-[#505f76]">{item.description}</p>
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
                key={item.title}
                className={`relative overflow-hidden rounded-2xl p-4 shadow-sm ${item.featured ? 'bg-[#004ac6] text-white' : 'border border-[#c3c6d7] bg-[#ededf9] text-[#191b23]'}`}
              >
                <div className="relative z-10 min-h-[216px]">
                  <h3 className={`mb-2 text-[20px] font-semibold leading-[1.35] ${item.featured ? 'text-white' : 'text-[#191b23]'}`}>{item.title}</h3>
                  <p className={`mb-5 text-[14px] leading-[1.5] ${item.featured ? 'text-white/90' : 'text-[#434655]'}`}>{item.description}</p>

                  <div className="mb-6 flex items-center gap-5">
                    <div>
                      <p className="text-[20px] font-semibold leading-[1.3]">{item.words}</p>
                      <p className={`text-[10px] uppercase tracking-[0.02em] ${item.featured ? 'text-white/80' : 'text-[#505f76]'}`}>Từ vựng</p>
                    </div>
                    <div className={`h-8 w-px ${item.featured ? 'bg-white/20' : 'bg-[#c3c6d7]'}`} />
                    <div>
                      <p className="text-[20px] font-semibold leading-[1.3]">{item.sets}</p>
                      <p className={`text-[10px] uppercase tracking-[0.02em] ${item.featured ? 'text-white/80' : 'text-[#505f76]'}`}>Bộ đề</p>
                    </div>
                  </div>

                  {item.featured ? (
                    <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[#004ac6] transition hover:bg-[#dbe1ff]">
                      {item.cta}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#505f76]">
                        <span>Đã hoàn thành 30%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/60">
                        <div className="h-full w-[30%] rounded-full bg-[#004ac6]" />
                      </div>
                      <button className="text-sm font-bold text-[#004ac6] hover:underline">{item.cta}</button>
                    </div>
                  )}
                </div>

                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
                  <BookOpenText className={`h-[112px] w-[112px] ${item.featured ? 'text-white/20' : 'text-[#004ac6]/10'}`} />
                </div>
              </article>
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
};
