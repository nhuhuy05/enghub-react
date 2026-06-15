import type { Test, TestCollection } from '@/features-admin/tests/types/adminTestTypes';

export type AdminListeningPartNumber = 1 | 2 | 3 | 4;

export interface TranscriptLine {
  id?: number;
  speaker: string | null;
  text_en: string;
  text_vi: string | null;
  start_ms: number | null;
  end_ms: number | null;
  order_index: number;
}

export interface AdminListeningGroupSummary {
  id: number;
  part_number: number;
  group_order: number;
  question_numbers: number[] | string;
  review_status?: string;
  missing_flags?: string[];
  has_audio?: boolean;
  audio_url?: string | null;
  transcript_line_count?: number;
  has_transcript_lines?: boolean;
}

export interface AdminListeningAudio {
  id?: number;
  media_asset_id: number;
  label?: string | null;
  url?: string | null;
  start_ms: number | null;
  end_ms: number | null;
  transcript_en: string | null;
  transcript_vi: string | null;
  transcript_lines?: TranscriptLine[];
}

export interface AdminListeningGroupDetail {
  id: number;
  part_number: number;
  group_order: number;
  question_numbers?: number[] | string;
  review_status?: string;
  missing_flags?: string[];
  audio: AdminListeningAudio | null;
}

export type AdminListeningCollection = TestCollection;
export type AdminListeningTest = Test;

