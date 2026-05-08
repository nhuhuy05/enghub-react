import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useExamSession } from '../hooks/useExamSession';
import { ExamHeader } from './interface/ExamHeader';
import { ExamFooter } from './interface/ExamFooter';
import { LeftPanel } from './interface/LeftPanel';
import { RightPanel } from './interface/RightPanel';
import { QuestionPalette } from './interface/QuestionPalette';

export const ExamInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    exam,
    isLoading,
    currentPart,
    currentQuestion,
    currentPartIndex,
    currentQuestionIndex,
    timeLeft,
    selectedAnswers,
    markedForReview,
    answeredCount,
    isPaletteOpen,
    handleNext,
    handlePrev,
    jumpToQuestion,
    setAnswer,
    toggleReview,
    togglePalette,
    isFirst,
    isLast
  } = useExamSession(id || '1');

  if (isLoading || !exam || !currentPart || !currentQuestion) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f0f2f5] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#004ac6]" />
        <p className="font-bold text-[#505f76]">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#f0f2f5] font-sans text-[#1a1a1a] overflow-hidden">
      <ExamHeader 
        partName={currentPart.name}
        currentQuestionId={currentQuestion.id}
        totalQuestions={200}
        answeredCount={answeredCount}
        timeLeft={timeLeft}
        onBack={() => navigate('/exam')}
      />

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        <LeftPanel 
          instruction={currentPart.instruction}
          question={currentQuestion}
        />
        <RightPanel 
          question={currentQuestion}
          selectedAnswers={selectedAnswers}
          onSelectAnswer={setAnswer}
        />
      </main>

      <ExamFooter 
        isMarked={!!markedForReview[currentQuestion.id]}
        onToggleReview={() => toggleReview(currentQuestion.id)}
        onPrev={handlePrev}
        onNext={handleNext}
        isFirst={isFirst}
        isLast={isLast}
        onTogglePalette={togglePalette}
      />

      {/* Question Palette Sidebar */}
      <QuestionPalette 
        isOpen={isPaletteOpen}
        onClose={togglePalette}
        exam={exam}
        selectedAnswers={selectedAnswers}
        markedForReview={markedForReview}
        currentPartIndex={currentPartIndex}
        currentQuestionIndex={currentQuestionIndex}
        onJump={jumpToQuestion}
      />
    </div>
  );
};
