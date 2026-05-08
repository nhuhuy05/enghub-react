import { useMemo, useState } from 'react';
import { BookText, Clock3, User, History, Dumbbell, Home } from 'lucide-react';
import { ExamModal } from './ExamModal';

const tabs = ['ETS 2024', 'ETS 2023', 'ETS 2022', 'Economy TOEIC', 'New Economy', 'Hacker TOEIC'];

const examCards = [
  { tab: 'ETS 2024', title: 'ETS 2024 Test 1', status: 'Đề mới', progress: 2, done: '4/200', learners: '12.4k lượt thi' },
  { tab: 'ETS 2024', title: 'ETS 2024 Test 2', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '8.1k lượt thi' },
  { tab: 'ETS 2024', title: 'ETS 2024 Test 3', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '6.5k lượt thi' },
  { tab: 'ETS 2024', title: 'ETS 2023 Test 1', status: 'Đang làm', progress: 42, done: '84/200', learners: '9.8k lượt thi' },
  { tab: 'ETS 2024', title: 'ETS 2023 Test 2', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '7.4k lượt thi' },
  { tab: 'ETS 2024', title: 'ETS 2023 Test 3', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '5.2k lượt thi' },
  { tab: 'ETS 2022', title: 'ETS 2022 Test 1', status: 'Đã hoàn thành', progress: 100, done: '200/200', learners: '11.2k lượt thi' },
  { tab: 'ETS 2022', title: 'ETS 2022 Test 2', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '4.8k lượt thi' },
  { tab: 'Economy TOEIC', title: 'Economy TOEIC Test 1', status: 'Đang làm', progress: 56, done: '112/200', learners: '6.9k lượt thi' },
  { tab: 'New Economy', title: 'New Economy Test 1', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '3.3k lượt thi' },
  { tab: 'New Economy', title: 'New Economy Test 2', status: 'Đề mới', progress: 3, done: '6/200', learners: '2.7k lượt thi' },
  { tab: 'Hacker TOEIC', title: 'Hacker TOEIC Test 1', status: 'Chưa luyện tập', progress: 0, done: '0/200', learners: '4.1k lượt thi' },
];

export const ExamPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('ETS 2024');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const visibleCards = useMemo(
    () => examCards.filter((item) => item.tab === activeTab),
    [activeTab],
  );

  return (
    <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <section className="mb-12">
        <h1 className="mb-2 text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[#191b23]">Kho đề thi thử</h1>
        <p className="text-[18px] leading-[1.6] text-[#505f76]">Luyện tập với bộ đề thi TOEIC chuẩn cấu trúc ETS mới nhất.</p>
      </section>

      <nav className="mb-8 flex gap-8 overflow-x-auto border-b border-[#c3c6d7] pb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition ${
                isActive ? 'border-b-2 border-[#004ac6] font-semibold text-[#004ac6]' : 'text-[#505f76] hover:text-[#004ac6]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((item, index) => (
          <article key={item.title} className="rounded-2xl border border-[#c3c6d7] bg-white p-6 shadow-sm transition hover:border-[#004ac6] hover:shadow-md">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="mb-2 inline-flex rounded-full bg-[#e7e7f3] px-3 py-1 text-xs font-medium text-[#505f76]">{item.tab}</span>
                <h2 className="text-[24px] font-semibold leading-[1.4] text-[#191b23]">{item.title}</h2>
              </div>
              {index === 0 ? <span className="rounded-full bg-[#e7e7f3] px-3 py-1 text-xs font-medium text-[#505f76]">Đề mới</span> : null}
            </div>

            <div className="mb-6 flex flex-wrap gap-4 text-[#505f76]">
              <div className="flex items-center gap-1">
                <BookText className="h-4 w-4" />
                <span className="text-sm font-medium">200 câu</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                <span className="text-sm font-medium">120 phút</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{item.learners}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[#505f76]">Trạng thái</span>
                <span className="font-semibold text-[#004ac6]">{item.progress > 0 ? item.done : item.status}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#ededf9]">
                <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${item.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1">
              <button
                onClick={() => setSelectedExam(item.title)}
                className="rounded-lg border border-[#004ac6] px-4 py-2 text-sm font-medium text-[#004ac6] transition hover:bg-[#dbe1ff]"
              >
                Luyện tập
              </button>
            </div>
          </article>
        ))}
      </section>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#c3c6d7] bg-[#faf8ff] px-4 py-2 shadow-lg lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center justify-around">
          <a className="flex flex-col items-center justify-center text-[#505f76]" href="#">
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Trang chủ</span>
          </a>
          <a className="flex flex-col items-center justify-center text-[#505f76]" href="#">
            <Dumbbell className="h-5 w-5" />
            <span className="text-xs font-medium">Luyện tập</span>
          </a>
          <a className="flex flex-col items-center justify-center rounded-full bg-[#2563eb] px-4 py-1 text-white" href="#">
            <BookText className="h-5 w-5" />
            <span className="text-xs font-medium">Thi thử</span>
          </a>
          <a className="flex flex-col items-center justify-center text-[#505f76]" href="#">
            <History className="h-5 w-5" />
            <span className="text-xs font-medium">Cá nhân</span>
          </a>
        </div>
      </nav>

      <ExamModal 
        isOpen={!!selectedExam} 
        onClose={() => setSelectedExam(null)} 
        examTitle={selectedExam || ''} 
      />
    </main>
  );
};
