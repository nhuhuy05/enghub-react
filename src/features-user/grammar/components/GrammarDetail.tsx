import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  Loader2,
  Target
} from 'lucide-react';
import { useGrammarDetail } from '../hooks/useGrammarDetail';

export const GrammarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    activeLesson,
    activeLessonId,
    setActiveLessonId,
    activeTab,
    setActiveTab
  } = useGrammarDetail(id || '1');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-gray-500">Đang tải bài học...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Không tìm thấy dữ liệu'}</h2>
        <button onClick={() => navigate('/grammar')} className="rounded-xl bg-blue-600 px-6 py-2 text-white font-bold">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-gray-100 bg-white shadow-sm z-10">
        <div className="mx-auto flex w-full max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/grammar')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="ml-4 h-6 w-px bg-gray-100" />
          <span className="ml-4 text-sm font-bold text-gray-500">{data?.title}</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 overflow-hidden bg-white shadow-sm px-4 sm:px-6 lg:px-8 mt-4 mb-6 rounded-3xl border border-gray-100">
        {/* Sidebar */}
        <aside className="w-[340px] shrink-0 border-r border-gray-100 bg-white overflow-y-auto scrollbar-thin">
          <div className="p-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Danh sách bài học</h2>
            <div className="space-y-2">
              {data.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`group relative flex w-full flex-col rounded-2xl p-4 text-left transition-all ${isActive
                        ? 'bg-[#00a2ed] text-white shadow-lg shadow-blue-100'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[13px] font-black ${isActive ? 'text-white/70' : 'text-gray-300'}`}>
                          {lesson.index}
                        </span>
                        <h3 className="text-[15px] font-bold leading-snug pr-4">
                          {lesson.title}
                        </h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/30 flex flex-col items-center scrollbar-hide relative">
          {/* Sticky Tabs */}
          <div className="sticky top-0 z-20 flex w-full justify-center bg-gray-50/80 px-6 py-6 backdrop-blur-md">
            <div className="flex w-full max-w-[800px] items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-gray-100">
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[15px] font-bold transition-all ${activeTab === 'theory'
                    ? 'bg-[#00a2ed] text-white shadow-md'
                    : 'text-[#64748b] hover:text-[#1e293b] hover:bg-gray-50'
                  }`}
              >
                <BookOpen className="h-4 w-4" />
                Bài học
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[15px] font-bold transition-all ${activeTab === 'practice'
                    ? 'bg-[#00a2ed] text-white shadow-md'
                    : 'text-[#64748b] hover:text-[#1e293b] hover:bg-gray-50'
                  }`}
              >
                <PlayCircle className="h-4 w-4" />
                Luyện tập
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${activeTab === 'practice' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {activeLesson?.questionCount || 0}
                </span>
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col items-center px-6 pb-10">

            {/* Theory Paper */}
            <div className="w-full max-w-[800px] rounded-3xl border border-gray-100 bg-white p-10 shadow-xl shadow-gray-200/20 min-h-[800px] mb-20">
              {activeTab === 'theory' ? (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeLesson?.content || '' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                    <Target className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Sẵn sàng luyện tập?</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                    Hệ thống đã chuẩn bị {activeLesson?.questionCount} câu hỏi thực hành dựa trên kiến thức bạn vừa học.
                  </p>
                  <button className="rounded-2xl bg-[#00a2ed] px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-200 hover:scale-105 transition-all">
                    Bắt đầu làm bài ngay
                  </button>
                </div>
              )}
            </div>

            <div className="h-20 shrink-0" /> {/* Bottom Spacing */}
            </div>
        </main>
        </div>
      </div>
  );
};
