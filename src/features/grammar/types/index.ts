export interface GrammarTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  progress: number;
  lessonsCount: number;
  isLocked?: boolean;
  isNew?: boolean;
}

export interface Lesson {
  id: string;
  index: string;
  title: string;
  questionCount: number;
  isFree: boolean;
  content: string; // Theory content in Markdown or HTML
}

export interface GrammarDetailData extends GrammarTopic {
  lessons: Lesson[];
}

export interface GrammarCategory {
  id: string;
  name: string;
}
