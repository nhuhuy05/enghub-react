export interface TestCollection {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Test {
  id: number;
  collection_id: number | null;
  collection_name: string | null;
  test_number: number | null;
  title: string;
  description: string;
  total_questions: number;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
}

export interface MediaAsset {
  id: number;
  test_id: number;
  label: string;
  media_type: 'image' | 'audio';
  cloudinary_public_id: string;
  url: string;
  duration_ms: number | null;
  original_filename: string;
  created_at: string;
}

export interface AudioRange {
  id: number;
  question_group_id: number;
  part_number: number;
  group_order: number;
  media_asset_id: number;
  start_ms: number;
  end_ms: number | null;
}

export interface ImportSummary {
  total_rows: number;
  valid_rows: number;
  error_count: number;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  summary: ImportSummary;
  errors: ImportError[];
}

export interface PreviewResult {
  test_id: number;
  question_count: number;
  invalid_correct_answer_count: number;
  part1_missing_image_count: number;
  listening_missing_audio_range_count: number;
  reading_missing_passage_count: number;
  publishable: boolean;
  errors: string[];
}

export interface PublishResult {
  success: boolean;
  is_published: boolean;
  errors: string[];
}
