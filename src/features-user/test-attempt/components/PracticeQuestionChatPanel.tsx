import { type MouseEvent as ReactMouseEvent } from 'react';
import { Bot, Loader2, Send, Square, X } from 'lucide-react';
import { FormattedChatContent } from './chatFormatting';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface PracticeQuestionChatPanelProps {
  error: string;
  hasAnswer: boolean;
  input: string;
  isOpen: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onInputChange: (value: string) => void;
  onWidthChange: (width: number) => void;
  onSend: () => void;
  onStop: () => void;
  panelWidth: number;
  questionNumber: number | null;
  streaming: boolean;
}

export const PracticeQuestionChatPanel = ({
  error,
  hasAnswer,
  input,
  isOpen,
  messages,
  onClose,
  onInputChange,
  onWidthChange,
  onSend,
  onStop,
  panelWidth,
  questionNumber,
  streaming,
}: PracticeQuestionChatPanelProps) => {
  const placeholder = hasAnswer
    ? 'Hỏi AI để giải thích vì sao đáp án đúng hoặc sai.'
    : 'Hỏi AI để nhận gợi ý. AI sẽ không tiết lộ đáp án đúng.';

  const handleResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = panelWidth;
    const maxWidth = Math.min(window.innerWidth - 48, 760);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = startWidth + startX - moveEvent.clientX;
      onWidthChange(Math.min(maxWidth, Math.max(360, nextWidth)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#1e293b]/30 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen max-w-[calc(100vw-48px)] flex-col bg-white shadow-2xl transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: panelWidth }}
      >
        <div
          className="absolute bottom-0 left-0 top-0 w-2 cursor-col-resize border-l border-[#d8dced] bg-transparent transition hover:bg-[#004ac6]/10"
          onMouseDown={handleResizeStart}
          aria-label="Kéo để đổi kích thước khung chat AI"
          title="Kéo để đổi kích thước"
        />
        <div className="flex shrink-0 items-center justify-between border-b border-[#d8dced] bg-[#004ac6] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold">Trợ lý AI</h2>
              <p className="text-xs font-semibold text-white/80">
                {questionNumber ? `Câu ${questionNumber}` : 'Chưa chọn câu'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng chat AI"
            title="Đóng chat AI"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f6f7fc] p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-[#004ac6] text-white'
                      : 'border border-[#d8dced] bg-white text-[#111827]'
                  }`}
                >
                  <div className={message.role === 'assistant' ? 'space-y-2' : 'whitespace-pre-wrap'}>
                    {message.role === 'assistant' ? (
                      <FormattedChatContent content={message.content || (message.streaming ? 'Đang suy nghĩ...' : '')} />
                    ) : (
                      message.content
                    )}
                    {message.role === 'assistant' && message.streaming && message.content && (
                      <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-pulse bg-[#004ac6]" />
                    )}
                  </div>
                  {message.streaming && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold opacity-70">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      đang trả lời
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="shrink-0 border-t border-[#fee4e2] bg-[#fef3f2] px-4 py-2 text-xs font-bold text-[#b42318]">
            {error}
          </div>
        )}

        <form
          className="shrink-0 border-t border-[#d8dced] bg-white p-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            disabled={streaming}
            placeholder={placeholder}
            className="h-20 w-full resize-none rounded-md border border-[#c3c6d7] px-3 py-2 text-sm leading-5 text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10 disabled:bg-[#f2f4f7]"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            {streaming && (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d0d5dd] px-3 text-xs font-semibold text-[#344054] transition hover:bg-[#f2f4f7]"
              >
                <Square className="h-3.5 w-3.5" />
                Dừng
              </button>
            )}
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#004ac6] px-3 text-xs font-semibold text-white transition hover:bg-[#003da3] disabled:cursor-not-allowed disabled:bg-[#98a2b3]"
            >
              <Send className="h-3.5 w-3.5" />
              Gửi
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
