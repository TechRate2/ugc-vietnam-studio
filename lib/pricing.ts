// Dynamic pricing calculator — matches Atlas Cloud's pricing logic
import type { Model } from './models';

// Resolution multiplier (Atlas uses higher resolution = higher cost)
const RESOLUTION_MULTI: Record<string, number> = {
  '480P': 0.5, '720P': 1, '1080P': 2, '1440P': 3, '2K': 3, '4K': 4,
  '720p': 1, '1080p': 2, '1440p': 3, '4k': 4,
};

// Quality multiplier
const QUALITY_MULTI: Record<string, number> = {
  low: 0.7, mid: 1, medium: 1, standard: 1, high: 1.5, pro: 2, master: 2.5,
};

// Aspect ratio could affect cost in some models (rare). We don't multiply by default.

/**
 * Compute the total cost for one generation given current form values.
 * Returns total in USD. Always >= base price.
 */
export function computePrice(m: Model, values: Record<string, any>): number {
  const base = m.pricing.perRun?.amount ?? m.pricing.input?.amount ?? 0;
  if (!base) return 0;

  const unit = m.pricing.perRun?.unit;
  let total = base;

  // Per-second video models: multiply by duration
  if (unit === 'second') {
    const dur = Number(values.duration ?? values.video_duration ?? values.length ?? 5);
    total = base * dur;
  }
  // Per-minute audio models: multiply by duration (minutes)
  else if (unit === 'minute') {
    const dur = Number(values.duration ?? values.length ?? 1);
    total = base * dur;
  }
  // Per-image models: multiply by num_images
  else if (unit === 'image') {
    const n = Number(values.num_images ?? values.n ?? values.count ?? 1);
    total = base * n;
  }

  // Resolution multiplier
  const res = String(values.resolution ?? values.size ?? '');
  if (res && RESOLUTION_MULTI[res] !== undefined) {
    total *= RESOLUTION_MULTI[res];
  }
  // Width × Height resolution
  if (values.width && values.height && !res) {
    const pixels = Number(values.width) * Number(values.height);
    if (pixels > 2073600) total *= 2; // > 1080P
    else if (pixels > 921600) total *= 1; // 720P-1080P
    else total *= 0.7; // < 720P
  }

  // Quality multiplier
  const quality = String(values.quality ?? values.tier ?? '').toLowerCase();
  if (quality && QUALITY_MULTI[quality] !== undefined) {
    total *= QUALITY_MULTI[quality];
  }

  return Math.round(total * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Format price for display: $1.40 or $0.014
 */
export function formatPrice(amount: number): string {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

/**
 * Pricing unit label in Vietnamese
 */
export function unitLabel(m: Model): string {
  const u = m.pricing.perRun?.unit;
  if (u === 'second') return 'giây';
  if (u === 'minute') return 'phút';
  if (u === 'image') return 'ảnh';
  if (u === 'token') return '1M token';
  return 'lần';
}
