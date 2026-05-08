import React from 'react';
import { Volume2, List } from 'lucide-react';
import type { Question } from '../../types';

interface LeftPanelProps {
  instruction: string;
  question: Question;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ instruction, question }) => {
  return (
    <div className="flex w-1/2 flex-col overflow-hidden rounded-xl border border-[#d1d5db] bg-white shadow-sm">
      <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-6 py-3">
        <h3 className="text-[15px] font-bold text-[#2563eb]">
          {instruction}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#fafafa]/50">
        {question.type === 'picture' && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-2xl w-full">
              <img 
                src={question.image} 
                alt="Question stimulus" 
                className="rounded-lg shadow-lg border border-gray-200 w-full object-cover aspect-[4/3] bg-white p-2"
              />
            </div>
          </div>
        )}
        {(question.type === 'audio_only' || question.type === 'audio_group') && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="h-32 w-32 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100 animate-pulse">
              <Volume2 className="h-12 w-12 text-[#004ac6]" />
            </div>
            <p className="text-lg font-bold text-[#505f76]">
              {question.type === 'audio_only' ? `Listening to Question ${question.id}...` : 'Listening to Conversation/Talk...'}
            </p>
          </div>
        )}
        {question.type === 'text_only' && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-[#004ac6]">
              <List className="h-10 w-10" />
            </div>
            <p className="text-lg font-bold text-[#505f76]">Part 5: Incomplete Sentences</p>
            <p className="text-sm text-[#94a3b8]">Câu hỏi và các lựa chọn hiển thị ở khung bên phải.</p>
          </div>
        )}
        {(question.type === 'passage_group') && (
          <div className="space-y-8 py-4 px-4 flex flex-col items-center">
            {question.content?.stimuli?.map((stimulus, idx) => (
              <div key={idx} className="w-full max-w-3xl">
                {stimulus.title && (
                  <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#004ac6] border-b-2 border-blue-100 pb-1 inline-block">
                    {stimulus.title}
                  </h4>
                )}
                {stimulus.type === 'text' && (
                  <div className="rounded-xl border border-gray-300 p-8 bg-white shadow-sm whitespace-pre-wrap leading-relaxed text-gray-800 text-[16px] font-serif italic">
                    {stimulus.content}
                  </div>
                )}
                {stimulus.type === 'image' && (
                  <div className="rounded-xl border border-gray-300 bg-white p-2 shadow-sm">
                    <img 
                      src={stimulus.url} 
                      alt="Part 7 Graphic" 
                      className="rounded-lg w-full object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
