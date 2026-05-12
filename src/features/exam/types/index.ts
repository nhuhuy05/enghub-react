export interface Exam {
  id: string;
  tab: string;
  title: string;
  status: string;
  progress: number;
  doneQuestions: number;
  totalQuestions: number;
  learnersCount: string;
  isNew?: boolean;
}

export type QuestionType = 'picture' | 'audio_only' | 'audio_group' | 'text_only' | 'passage_group';

export interface SubQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Stimulus {
  type: 'text' | 'image';
  title?: string;
  content?: string;
  url?: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  image?: string;
  text?: string;
  instruction?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  content?: {
    passage?: string;
    stimuli?: Stimulus[];
  };
  subQuestions?: SubQuestion[];
}

export interface Part {
  id: number;
  name: string;
  instruction: string;
  questions: Question[];
}

export interface ExamDetail {
  id: string;
  title: string;
  parts: Part[];
}
