import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useVocabularyDetail } from '../hooks/useVocabularyDetail';

export const VocabularyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useVocabularyDetail(id || '1');
  const [viewMode, setViewMode] = useState<'list' | 'flashcard'>('flashcard');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-gray-500">Đang tải từ vựng...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Không tìm thấy dữ liệu'}</h2>
        <button onClick={() => navigate('/vocabulary')} className="rounded-xl bg-blue-600 px-6 py-2 text-white font-bold">Quay lại</button>
      </div>
    );
  }

  const currentWord = data.words[currentWordIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prev) => (prev + 1) % data.words.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentWordIndex((prev) => (prev - 1 + data.words.length) % data.words.length);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="ml-4 h-6 w-px bg-gray-100" />
          <div className="ml-4 flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-500">
              {data.category}
            </span>
            <span className="text-sm font-bold text-gray-900">{data.title}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-2xl bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'flashcard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Flashcard
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Danh sách
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {viewMode === 'flashcard' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-10 py-10">
            {/* Progress Bar */}
            <div className="w-full max-w-[600px] space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-400">
                <span>{currentWordIndex + 1} / {data.words.length} từ</span>
                <span>{Math.round(((currentWordIndex + 1) / data.words.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${((currentWordIndex + 1) / data.words.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            <div 
              className="perspective-1000 group relative h-[400px] w-full max-w-[600px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative h-full w-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-[40px] border-2 border-gray-100 bg-white p-10 shadow-2xl shadow-blue-900/5">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <h2 className="text-5xl font-black text-gray-900 mb-2">{currentWord.term}</h2>
                  <div className="flex items-center gap-3 text-lg font-medium text-gray-400">
                    <span>{currentWord.phonetic}</span>
                    <button className="rounded-full p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="absolute bottom-10 text-sm font-bold text-gray-300 uppercase tracking-widest">Nhấn để xem nghĩa</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center rounded-[40px] border-2 border-blue-100 bg-blue-50 p-10 shadow-2xl shadow-blue-900/5 text-center">
                  <span className="mb-4 rounded-full bg-blue-100 px-4 py-1 text-xs font-black uppercase tracking-widest text-blue-600">
                    {currentWord.partOfSpeech}
                  </span>
                  <h3 className="mb-6 text-3xl font-bold text-gray-900">{currentWord.definition}</h3>
                  <div className="max-w-md space-y-3">
                    <p className="text-lg italic text-gray-600 leading-relaxed">"{currentWord.example}"</p>
                    <p className="text-sm font-medium text-blue-500">{currentWord.exampleTranslation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePrev}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-600 shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-100 text-blue-600 shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <RotateCcw className="h-7 w-7" />
              </button>
              <button 
                onClick={handleNext}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#004ac6] text-white shadow-xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {data.words.map((word) => (
              <div 
                key={word.id}
                className="group flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 transition-all hover:border-blue-100 hover:shadow-xl sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-gray-900">{word.term}</h3>
                    <span className="text-sm font-medium text-gray-400">{word.phonetic}</span>
                    <button className="text-gray-300 hover:text-blue-500 transition-colors">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase text-blue-600">
                      {word.partOfSpeech}
                    </span>
                    <p className="text-[15px] font-bold text-gray-700">{word.definition}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-sm italic text-gray-500 leading-relaxed mb-1">"{word.example}"</p>
                    <p className="text-[13px] font-medium text-gray-400">{word.exampleTranslation}</p>
                  </div>
                </div>
                {word.imageUrl && (
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                    <img src={word.imageUrl} alt={word.term} className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Style for flashcard animation */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
