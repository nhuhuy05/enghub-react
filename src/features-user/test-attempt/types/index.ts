export type AttemptMode = 'MOCK' | 'PRACTICE';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface PublishedTestCollection {
  id: number;
  name: string;
  description: string;
  createdAt?: string | null;
}

export interface PublishedTest {
  id: number;
  collectionId: number | null;
  collectionName: string | null;
  testNumber: number | null;
  title: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  createdAt?: string | null;
}

export interface StartAttemptInput {
  testId: number;
  mode?: AttemptMode;
  partNumbers?: number[];
}

export interface AttemptSummary {
  id: number;
  testId: number;
  testTitle?: string | null;
  mode: AttemptMode;
  status: AttemptStatus;
  correctCount: number;
  listeningCorrect: number;
  readingCorrect: number;
  answeredCount: number;
  totalQuestions: number;
  totalScore: number | null;
  readingScore: number | null;
  listeningScore: number | null;
  durationSeconds: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  remainingSeconds: number | null;
  partNumbers: number[];
}

export interface PageResult<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AttemptMedia {
  id: number;
  label: string | null;
  url: string | null;
  orderIndex?: number | null;
  startMs?: number | null;
  endMs?: number | null;
  transcriptEn?: string | null;
  transcriptVi?: string | null;
}

export interface AttemptPassage {
  id?: number;
  title: string | null;
  passageType: string | null;
  contentFormat: string | null;
  contentEn: string | null;
  contentVi: string | null;
  vocabHints: string | null;
  label?: string | null;
  url?: string | null;
  orderIndex?: number | null;
}

export interface AttemptAnswer {
  id: number;
  label: string;
  answerTextEn: string | null;
  answerTextVi: string | null;
  isCorrect?: boolean;
}

export interface AttemptQuestion {
  id: number;
  questionNumber: number;
  questionTextEn: string | null;
  questionTextVi: string | null;
  selectedAnswerId: number | null;
  correctAnswerId?: number | null;
  correct?: boolean | null;
  explanationVi?: string | null;
  answers: AttemptAnswer[];
}

export interface AttemptGroup {
  id: number;
  groupOrder: number;
  images: AttemptMedia[];
  audio: AttemptMedia | null;
  passages: AttemptPassage[];
  transcriptEn?: string | null;
  transcriptVi?: string | null;
  questions: AttemptQuestion[];
}

export interface AttemptPart {
  partNumber: number;
  title: string;
  groups: AttemptGroup[];
}

export interface AttemptContent {
  attempt: AttemptSummary;
  testId: number;
  title: string;
  description: string;
  durationMinutes: number;
  parts: AttemptPart[];
}

export interface SaveAnswerInput {
  questionId: number;
  selectedAnswerId: number | null;
}

export interface SaveAnswerResult {
  attemptId: number;
  questionId: number;
  selectedAnswerId: number | null;
  correct: boolean | null;
  correctAnswerId: number | null;
  explanationVi: string | null;
  transcriptEn?: string | null;
  transcriptVi?: string | null;
  answeredAt: string | null;
}

export interface AttemptResult {
  attempt: AttemptSummary;
  parts: AttemptPart[];
}

export interface PracticeQuestionChatRequest {
  message: string;
  conversationId?: string | null;
}

export type PracticeQuestionChatEvent =
  | { event: 'delta'; data: { text: string } }
  | { event: 'done'; data: Record<string, never> }
  | { event: 'error'; data: { message: string } };
