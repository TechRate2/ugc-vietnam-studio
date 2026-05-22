/**
 * Types match backend agent/model_specs.py — SOURCE OF TRUTH.
 */

export type ModelKey =
  | 'vidu_q3_ref'
  | 'vidu_q3_mix_ref'
  | 'wan_2_7_i2v'
  | 'wan_2_7_t2v'
  | 'seedance_2_0_ref'
  | 'seedance_2_0_i2v'
  | 'seedance_2_0_t2v';

export interface ModelGuide {
  best_for: string[];
  strengths: string[];
  weaknesses: string[];
  ideal_user: string;
  niche_tags: string[];
  sample_prompt: string;
  rating: string;
  sources: string[];
}

export interface ModelSummary {
  key: ModelKey;
  endpoint: string;
  name_vn: string;
  vendor: string;
  variant: 'reference-to-video' | 'image-to-video' | 'text-to-video';
  cost_per_second_usd: number;
  duration: { min: number; max: number; default: number; auto_sentinel?: number };
  resolution_options: string[];
  aspect_ratio_options: string[] | null;
  max_references: number;
  audio_capability: 'native' | 'driven' | 'none';
  extra_fields: string[];
  guide?: ModelGuide | null;
  demos?: any;
}

export interface ModelSpec extends ModelSummary {
  required: string[];
  images_field: 'images' | 'image' | 'reference_images' | null;
  resolution: { options: string[]; default: string };
  aspect_ratio: { field_name: string; options: string[]; default: string } | null;
  extra_fields_detail?: Record<string, any>;
  available: boolean;
}

export interface DirectVideoRequest {
  model_key: ModelKey;
  prompt: string;
  images?: string[];
  image?: string;
  last_image?: string;
  duration_s?: number;
  resolution?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  seed?: number;
  generate_audio?: boolean;
  movement_amplitude?: 'auto' | 'small' | 'medium' | 'large';
  audio_url?: string;
  prompt_extend?: boolean;
  watermark?: boolean;
  return_last_frame?: boolean;
}

export interface PreviewPayloadResponse {
  payload: Record<string, any>;
  cost_usd: number;
  cost_vnd: number;
  exceeds_budget: boolean;
  endpoint: string;
}

export interface DirectJobStatus {
  job_id: string;
  prediction_id: string;
  status: 'submitted' | 'pending' | 'completed' | 'succeeded' | 'failed';
  model_key: ModelKey;
  video_url?: string;
  error?: string;
}
