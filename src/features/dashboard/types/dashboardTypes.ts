export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface StatCard {
  label: string;
  value: string;
  helper?: string;
}

export interface ProgressItem {
  label: string;
  value: number;
  color: string;
}

export interface LessonItem {
  title: string;
  progress: string;
  description: string;
  icon: string;
}

export interface ShortcutItem {
  title: string;
  icon: string;
}
