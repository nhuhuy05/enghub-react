import React from 'react';
import {
  Bot,
  CheckCircle2,
  Loader2,
  MessageCircleQuestion,
  Send,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { aiTutorService } from '../../services/aiTutorService';
import type { Question } from '../../types';

interface RightPanelProps {
  question: Question;
  selectedAnswers: Record<number, string>;
  onSelectAnswer: (questionId: number, answer: string) => void;
  shouldShowFeedback: boolean;
  className?: string;
}

interface AiChatProps {
  question: Question;
  selectedAnswers: Record<number, string>;
  shouldShowFeedback: boolean;
}

const AiChat: React.FC<AiChatProps> = ({
  question,
  selectedAnswers,
  shouldShowFeedback,
}) => {
  const [aiQuestion, setAiQuestion] = React.useState('');
  const [aiMessages, setAiMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  const handleSendAiQuestion = async () => {
    const trimmedQuestion = aiQuestion.trim();
    if (!trimmedQuestion || isAiLoading) return;

    setAiMessages((current) => [...current, { role: 'user', text: trimmedQuestion }]);
    setAiQuestion('');
    setAiError(null);
    setIsAiLoading(true);

    try {
      const answer = await aiTutorService.askQuestion({
        question,
        selectedAnswers,
        userQuestion: trimmedQuestion,
        includeAnswerKey: shouldShowFeedback,
      });
      setAiMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Không thể gọi AI lúc này.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderFormattedAiText = (text: string) => {
    const lines = text
      .replace(/\*\*(\d+\.)/g, '\n\n$1')
      .replace(/\*\*/g, '')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`} className="text-sm leading-6">
            {line}
          </p>
        ))}
      </div>
    );
  };

  return (
    <section className="rounded-xl border border-[#bfdbfe] bg-[#f8fbff] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#004ac6] text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0f172a]">AI Assistant</h4>
          <p className="mt-1 text-sm leading-6 text-[#475569]">
            Bạn có thể hỏi vì sao đáp án đúng, cách loại trừ đáp án sai, hoặc điểm ngữ pháp trong câu này.
          </p>
        </div>
      </div>

      {(aiMessages.length > 0 || isAiLoading || aiError) && (
        <div className="mt-4 space-y-3">
          {aiMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                message.role === 'user'
                  ? 'ml-10 bg-[#e0edff] text-[#0f172a]'
                  : 'mr-10 border border-[#dbeafe] bg-white text-[#334155]'
              }`}
            >
              {message.role === 'assistant' ? renderFormattedAiText(message.text) : message.text}
            </div>
          ))}
          {isAiLoading && (
            <div className="mr-10 flex items-center gap-2 rounded-lg border border-[#dbeafe] bg-white px-3 py-2 text-sm font-medium text-[#475569]">
              <Loader2 className="h-4 w-4 animate-spin text-[#004ac6]" />
              AI đang trả lời...
            </div>
          )}
          {aiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {aiError}
            </div>
          )}
        </div>
      )}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSendAiQuestion();
        }}
      >
        <input
          value={aiQuestion}
          onChange={(event) => setAiQuestion(event.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          className="min-w-0 flex-1 rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#004ac6] focus:ring-2 focus:ring-[#bfdbfe]"
        />
        <button
          type="submit"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004ac6] text-white transition hover:bg-[#003896] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
          disabled={!aiQuestion.trim() || isAiLoading}
          aria-label="Gửi câu hỏi AI"
        >
          {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </section>
  );
};

export const RightPanel: React.FC<RightPanelProps> = ({
  question,
  selectedAnswers,
  onSelectAnswer,
  shouldShowFeedback,
  className = 'w-1/2',
}) => {
  const [isAiChatOpen, setIsAiChatOpen] = React.useState(false);

  const renderFeedback = (qId: number, correctAnswer?: string, explanation?: string) => {
    const selectedAnswer = selectedAnswers[qId];
    if (!shouldShowFeedback || !selectedAnswer || !correctAnswer) return null;

    const isCorrect = selectedAnswer === correctAnswer;

    return (
      <div className={`mt-3 rounded-lg border p-3 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <p className={`flex items-center gap-2 text-sm font-black ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
          {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {isCorrect ? 'Chính xác' : `Chưa đúng. Đáp án đúng là ${correctAnswer}`}
        </p>
        {explanation && <p className="mt-1.5 text-xs leading-5 text-[#334155]">{explanation}</p>}
      </div>
    );
  };

  const renderOptions = (qId: number, options: string[], correctAnswer?: string, explanation?: string) => {
    const selectedAnswer = selectedAnswers[qId];
    const showQuestionFeedback = shouldShowFeedback && Boolean(selectedAnswer);

    return (
      <div>
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = showQuestionFeedback && option === correctAnswer;

            return (
              <button
                key={option}
                onClick={() => onSelectAnswer(qId, option)}
                disabled={showQuestionFeedback}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  isCorrectOption
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : isSelected
                      ? 'border-[#004ac6] bg-blue-50 text-[#004ac6] ring-1 ring-[#004ac6]'
                      : 'border-gray-200 text-gray-600 hover:border-[#004ac6] hover:bg-gray-50'
                } disabled:cursor-default`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCorrectOption
                    ? 'border-emerald-500 bg-emerald-500'
                    : isSelected
                      ? 'border-[#004ac6] bg-[#004ac6]'
                      : 'border-gray-300'
                }`}>
                  {(isSelected || isCorrectOption) && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                {option}
              </button>
            );
          })}
        </div>
        {renderFeedback(qId, correctAnswer, explanation)}
      </div>
    );
  };

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-[#d1d5db] bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] bg-[#fafafa] px-6 py-3">
        <h3 className="text-base font-bold text-gray-700">Question</h3>
        <button
          type="button"
          onClick={() => setIsAiChatOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-sm font-bold text-[#004ac6] shadow-sm transition hover:border-[#93c5fd] hover:bg-[#dbeafe] active:scale-[0.98]"
          aria-expanded={isAiChatOpen}
          aria-label="Hỏi đáp AI"
        >
          <Sparkles className="h-4 w-4" />
          <span>Hỏi đáp AI</span>
          <MessageCircleQuestion className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-10">
          {!question.subQuestions ? (
            <div className="space-y-6">
              {question.type === 'text_only' ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-[17px] font-medium leading-relaxed text-gray-800">
                    <span className="mr-2 font-bold text-[#004ac6]">{question.id}.</span>
                    {question.text}
                  </p>
                </div>
              ) : (
                <p className="text-[15px] font-bold text-gray-800">{question.id}. Choose the best answer</p>
              )}
              {renderOptions(question.id, question.options || [], question.correctAnswer, question.explanation)}
              {isAiChatOpen && (
                <AiChat
                  key={question.id}
                  question={question}
                  selectedAnswers={selectedAnswers}
                  shouldShowFeedback={shouldShowFeedback}
                />
              )}
            </div>
          ) : (
            question.subQuestions.map((sq) => (
              <div key={sq.id} className="space-y-4 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <p className="text-[15px] font-bold text-gray-800">{sq.id}. {sq.text}</p>
                {renderOptions(sq.id, sq.options, sq.correctAnswer, sq.explanation)}
              </div>
            ))
          )}
          {question.subQuestions && isAiChatOpen ? (
            <AiChat
              key={question.id}
              question={question}
              selectedAnswers={selectedAnswers}
              shouldShowFeedback={shouldShowFeedback}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
