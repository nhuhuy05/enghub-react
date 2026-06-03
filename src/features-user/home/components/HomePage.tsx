import { ArrowRight, BookOpenText, CheckCircle2, Headphones, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features-user/auth/store/useAuthStore';

const features = [
  {
    title: 'Luyện nghe có nhịp',
    description: 'Ôn từng câu, nghe chép và luyện phản xạ theo nhiều chế độ.',
    icon: Headphones,
  },
  {
    title: 'Đọc hiểu sát đề',
    description: 'Luyện Reading Part 7 với nội dung song ngữ và từ vựng gợi ý.',
    icon: BookOpenText,
  },
  {
    title: 'Theo dõi tiến bộ',
    description: 'Giữ mọi bài luyện, đề thi và mục tiêu điểm số trong một nơi.',
    icon: LineChart,
  },
];

const highlights = ['Miễn phí bắt đầu', 'Có full test TOEIC', 'Phù hợp tự học mỗi ngày'];

export const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startPath = isAuthenticated ? '/tests' : '/register';

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#172033]">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <div className="inline-flex items-center rounded-full bg-[#dff3fc] px-4 py-2 text-sm font-bold text-[#087fd8]">
            Nền tảng luyện TOEIC miễn phí cho người mới bắt đầu
          </div>

          <h1 className="mt-7 text-3xl font-black text-[#172033] leading-[1.05] lg:text-6xl">
            Học Toeic mỗi ngày, tiến bộ mỗi ngày
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#62728a]">
            EngHub giúp bạn luyện nghe, đọc, từ vựng và đề thi trong một trải nghiệm gọn gàng, dễ theo dõi, dễ quay lại học tiếp.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to={startPath}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#004ac6] px-7 py-3.5 text-base font-black text-white shadow-[0_18px_42px_rgba(24,169,214,0.22)] transition hover:bg-[#1099c6]"
            >
              Bắt đầu học
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/tests"
              className="inline-flex items-center justify-center rounded-lg border border-[#004ac6] bg-white px-7 py-3.5 text-base font-black text-[#172033] transition hover:border-[#18a9d6] hover:text-[#0b89b8]"
            >
              Làm bài test thử
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm font-bold text-[#53647d] sm:flex-row sm:flex-wrap">
            {highlights.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#0faa55]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#d8dced] bg-white p-5 shadow-[0_24px_70px_rgba(16,24,40,0.10)]">
          <div className="rounded-xl bg-[#f5f8fc] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#004ac6]">Lộ trình hôm nay</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#0faa55] shadow-sm">45 phút</div>
            </div>

            <div className="mt-6 space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-xl border border-[#e4eaf2] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eaf0ff] text-[#004ac6]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#172033]">{feature.title}</h3>
                        <p className="mt-1 text-sm font-medium leading-6 text-[#667085]">{feature.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
