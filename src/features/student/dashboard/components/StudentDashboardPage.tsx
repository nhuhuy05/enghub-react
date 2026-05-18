import { ArrowRight, Lightbulb, Rocket, TimerReset } from 'lucide-react';

const weeklyProgress = [
  { label: 'T1', value: 42, color: 'bg-[#dfe4fb]' },
  { label: 'T2', value: 58, color: 'bg-[#e8e7fb]' },
  { label: 'T3', value: 72, color: 'bg-[#9cb7eb]' },
  { label: 'Hiện tại', value: 92, color: 'bg-[#0d4ecb]' },
];

const lessons = [
  {
    title: 'Part 2: Question-Response',
    progress: 'Đã học: 15/20 câu • Độ chính xác: 85%',
    description: 'Luyện phản xạ nghe và chọn đáp án nhanh hơn.',
    icon: '🎧',
  },
  {
    title: 'Business Vocabulary: Marketing',
    progress: 'Đã học: 45/50 từ • 5 từ cần ôn lại',
    description: 'Nhóm từ vựng theo chủ đề để dễ ghi nhớ.',
    icon: '文',
  },
  {
    title: 'Grammar: Gerunds vs Infinitives',
    progress: 'Đã học: Hoàn thành • Độ chính xác: 92%',
    description: 'Ôn nhanh ngữ pháp nền tảng thường gặp.',
    icon: 'A↗',
  },
];

const quickCards = [
  { title: 'Daily Quiz', icon: Rocket },
  { title: 'Mock Exam', icon: TimerReset },
];

export const StudentDashboardPage = () => {
  return (
    <main className="min-h-screen bg-[#f6f7fc] px-4 py-8 pt-28 text-[#191b23] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[38px] font-extrabold tracking-[-0.03em] text-[#111827]">Xin chào, Student!</h1>
            <p className="mt-2 text-base text-[#667085]">Bạn đã hoàn thành 75% mục tiêu tuần này. Giữ vững phong độ nhé!</p>
          </div>
          <button className="inline-flex items-center gap-3 rounded-xl bg-[#0d4ecb] px-6 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(13,78,203,0.28)] transition hover:translate-y-[-1px] hover:bg-[#0b43b0] active:scale-[0.98]">
            <Rocket className="h-5 w-5" />
            Luyện thi ngay
          </button>
        </section>

        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-[#d9ddec] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">Target Score</p>
            <div className="mt-2 text-[56px] font-extrabold leading-none text-[#0d4ecb]">850</div>
            <p className="mt-3 text-sm text-[#505f76]">Current Avg: <span className="font-bold text-[#191b23]">720</span></p>
            <div className="mt-16">
              <div className="h-2 overflow-hidden rounded-full bg-[#edf0fb]">
                <div className="h-full w-[88%] rounded-full bg-[#0d4ecb]" />
              </div>
              <div className="mt-2 flex justify-between text-sm text-[#505f76]">
                <span>Progress</span>
                <span>Target Line</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d9ddec] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#111827]">Biểu đồ tiến độ (Weekly)</h2>
              <span className="rounded-full bg-[#f4f5ff] px-4 py-2 text-sm font-medium text-[#505f76]">4 tuần gần nhất</span>
            </div>
            <div className="mt-8 grid h-[220px] grid-cols-4 items-end gap-3">
              {weeklyProgress.map((item) => (
                <div key={item.label} className="flex h-full flex-col justify-end">
                  <div className={`rounded-t-xl ${item.color}`} style={{ height: `${item.value}%` }} />
                  <div className="mt-2 text-center text-sm text-[#667085]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#111827]">Bài học gần đây</h2>
              <button className="text-sm font-medium text-[#0d4ecb] hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <article key={lesson.title} className="flex items-center justify-between rounded-2xl border border-[#d9ddec] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f5ff] text-2xl">{lesson.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#111827]">{lesson.title}</h3>
                      <p className="text-sm text-[#667085]">{lesson.progress}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#98a2b3]" />
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div>
              <h2 className="mb-5 text-2xl font-bold text-[#111827]">Tiến độ nhanh</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.title} className="flex min-h-[104px] flex-col justify-between rounded-2xl border border-[#d9ddec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
                      <Icon className="h-5 w-5 text-[#0d4ecb]" />
                      <span className="text-sm font-semibold text-[#111827]">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-5 text-2xl font-bold text-[#111827]">Mẹo học tập</h2>
              <div className="rounded-2xl bg-gradient-to-br from-[#0d4ecb] to-[#0a3d9f] p-6 text-white shadow-[0_12px_30px_rgba(13,78,203,0.25)]">
                <Lightbulb className="h-7 w-7" />
                <p className="mt-6 text-[15px] leading-7 text-white/90">
                  “Để đạt điểm cao trong Listening Part 3 &amp; 4, hãy tranh thủ đọc trước câu hỏi và các lựa chọn trong lúc băng đang đọc hướng dẫn.”
                </p>
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/95 hover:underline">
                  Xem thêm mẹo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};
