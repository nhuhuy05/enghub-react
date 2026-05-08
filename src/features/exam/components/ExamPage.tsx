import { useMemo, useState } from 'react';
import { 
  BookText, 
  Clock3, 
  User, 
  History, 
  Dumbbell, 
  Home, 
  ChevronRight,
  Loader2,
  Search
} from 'lucide-react';
import { ExamModal } from './ExamModal';
import { useExams } from '../hooks/useExams';
import type { Exam } from '../types';

const tabs = ['Tất cả', 'ETS 2024', 'ETS 2023', 'ETS 2022', 'Economy TOEIC', 'New Economy', 'Hacker TOEIC'];

export const ExamPage = () => {
  const { exams, isLoading, error } = useExams();
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      return activeTab === 'Tất cả' || exam.tab === activeTab;
    });
  }, [exams, activeTab]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center gap-4">
        <div className="rounded-full bg-red-50 p-4">
          <History className="h-10 w-10 text-red-400" />
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
    <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-10 pb-24 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="mb-3 text-[40px] font-black leading-tight tracking-tight text-[#191b23]">Kho đề thi thử</h1>
            <p className="text-[18px] font-medium text-[#505f76] max-w-2xl">
              Nâng cao kỹ năng với hệ thống đề thi TOEIC chuẩn cấu trúc ETS mới nhất. 
              Tự động chấm điểm và giải thích chi tiết.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2 border border-blue-100">
            <History className="h-5 w-5 text-[#2563eb]" />
            <span className="text-sm font-bold text-[#2563eb]">Lịch sử làm bài</span>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="mb-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-[#505f76] border border-[#e2e8f0] hover:border-[#004ac6] hover:text-[#004ac6]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Exam Grid */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
          <p className="font-bold text-[#505f76]">Đang tải danh sách đề thi...</p>
        </div>
      ) : filteredExams.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <article 
              key={exam.id} 
              className="group relative flex flex-col rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all hover:border-[#004ac6] hover:shadow-xl hover:-translate-y-1"
            >
              {exam.isNew && (
                <div className="absolute -right-2 -top-2 z-10 rotate-12 rounded-lg bg-red-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg">
                  New
                </div>
              )}
              
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#004ac6]">
                    {exam.tab}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#94a3b8]">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold">{exam.learnersCount}</span>
                  </div>
                </div>
                <h2 className="text-[20px] font-bold leading-tight text-[#191b23] group-hover:text-[#004ac6] transition-colors line-clamp-2">
                  {exam.title}
                </h2>
              </div>

              <div className="mb-6 flex items-center gap-4 text-[#64748b]">
                <div className="flex items-center gap-1.5">
                  <BookText className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold">{exam.totalQuestions} câu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-bold">120 phút</span>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-[#94a3b8]">Trạng thái</span>
                    <span className={exam.progress > 0 ? 'text-[#004ac6]' : 'text-[#64748b]'}>
                      {exam.progress > 0 ? `${exam.doneQuestions}/${exam.totalQuestions} câu` : exam.status}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div 
                      className="h-full rounded-full bg-[#004ac6] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,74,198,0.4)]" 
                      style={{ width: `${exam.progress}%` }} 
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExam(exam)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#004ac6] py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#003896] hover:shadow-blue-300 active:scale-95"
                >
                  Luyện tập ngay
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-[#191b23]">Không tìm thấy đề thi</h3>
          <p className="text-sm text-[#64748b]">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
        </div>
      )}

      {/* Mobile Navigation */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex w-[90%] -translate-x-1/2 items-center justify-around rounded-3xl border border-white/20 bg-white/80 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
        <button className="flex flex-col items-center gap-1 text-[#64748b]">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748b]">
          <Dumbbell className="h-5 w-5" />
          <span className="text-[10px] font-bold">Luyện tập</span>
        </button>
        <button className="flex -translate-y-6 flex-col items-center gap-1 rounded-full bg-[#004ac6] p-4 text-white shadow-xl shadow-blue-200">
          <BookText className="h-6 w-6" />
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748b]">
          <History className="h-5 w-5" />
          <span className="text-[10px] font-bold">Lịch sử</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#64748b]">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-bold">Cá nhân</span>
        </button>
      </nav>

      <ExamModal 
        isOpen={!!selectedExam} 
        onClose={() => setSelectedExam(null)} 
        examTitle={selectedExam?.title || ''} 
      />
    </main>
  );
};
