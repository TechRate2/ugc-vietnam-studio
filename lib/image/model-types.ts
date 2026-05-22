/**
 * Image model types — match backend agent/image_specs.py
 */

export type ImageModelKey =
  | 'seedream_v45'
  | 'seedream_v45_edit'
  | 'nano_banana_pro_t2i'
  | 'nano_banana_pro_edit'
  | 'nano_banana_2_t2i'
  | 'nano_banana_2_edit'
  | 'wan_2_7_t2i'
  | 'wan_2_7_edit';

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

export interface ImageModelSummary {
  key: ImageModelKey;
  endpoint: string;
  name_vn: string;
  vendor: string;
  variant: 'text-to-image' | 'edit';
  cost_per_image_usd: number;
  min_references: number;
  max_references: number;
  size_options: string[] | null;
  aspect_ratio_options: string[] | null;
  resolution_options: string[] | null;
  extras: Record<string, any>;
  guide?: ModelGuide | null;
  demos?: any;
}

export interface DirectImageRequest {
  model_key: ImageModelKey;
  prompt: string;
  images?: string[];
  size?: string;
  aspect_ratio?: string;
  resolution?: string;
  negative_prompt?: string;
  seed?: number;
  n?: number;
  output_format?: string;
  media_resolution?: string;
  thinking_level?: string;
  thinking_mode?: boolean;
  enable_web_search?: boolean;
  enable_image_search?: boolean;
  enable_base64_output?: boolean;
  enable_sync_mode?: boolean;
}

export interface ImagePreviewResponse {
  payload: Record<string, any>;
  cost_usd: number;
  cost_vnd: number;
  exceeds_budget: boolean;
  endpoint: string;
}

export interface ImageJobStatus {
  job_id: string;
  prediction_id: string;
  status: 'submitted' | 'pending' | 'completed' | 'succeeded' | 'failed';
  model_key: ImageModelKey;
  image_url?: string;
  image_urls?: string[];
  error?: string;
}
