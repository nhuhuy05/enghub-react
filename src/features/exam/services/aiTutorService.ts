import type { Question } from '../types';

interface AskAiTutorParams {
  question: Question;
  selectedAnswers: Record<number, string>;
  userQuestion: string;
  includeAnswerKey: boolean;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite';

const buildQuestionContext = (
  question: Question,
  selectedAnswers: Record<number, string>,
  includeAnswerKey: boolean
) => {
  if (question.subQuestions?.length) {
    return question.subQuestions.map((subQuestion) => ({
      id: subQuestion.id,
      text: subQuestion.text,
      options: subQuestion.options,
      selectedAnswer: selectedAnswers[subQuestion.id] || null,
      correctAnswer: includeAnswerKey ? subQuestion.correctAnswer : undefined,
      explanation: includeAnswerKey ? subQuestion.explanation : undefined,
    }));
  }

  return {
    id: question.id,
    type: question.type,
    text: question.text,
    options: question.options || [],
    selectedAnswer: selectedAnswers[question.id] || null,
    passage: question.content?.passage,
    stimuli: question.content?.stimuli,
    correctAnswer: includeAnswerKey ? question.correctAnswer : undefined,
    explanation: includeAnswerKey ? question.explanation : undefined,
  };
};

export const aiTutorService = {
  askQuestion: async ({
    question,
    selectedAnswers,
    userQuestion,
    includeAnswerKey,
  }: AskAiTutorParams) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Add it to .env.local and restart Vite.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  'Bạn là gia sư TOEIC cho người học Việt Nam. Luôn trả lời bằng tiếng Việt có dấu, ngắn gọn, dễ hiểu. Giải thích rõ ngữ pháp/từ vựng. Không tiết lộ đáp án đúng nếu đáp án không có trong context.',
              },
            ],
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: JSON.stringify(
                    {
                      task: 'Help the learner understand this TOEIC question.',
                      questionContext: buildQuestionContext(question, selectedAnswers, includeAnswerKey),
                      userQuestion,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 768,
          },
        }),
      }
    );

    const data = (await response.json()) as GeminiGenerateContentResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini request failed.');
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!text) {
      throw new Error('Gemini did not return a response.');
    }

    return text;
  },
};
