// Auto-generated (Vidu + 2 deprecated models removed)
import type { Model } from './models';

export const REAL_MODELS: Model[] = [
  {
    slug: "alibaba-happyhorse-1-0-text-to-video",
    name: "HappyHorse-1.0 Text-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Generates videos from text prompts with HappyHorse 1.0, supporting 720P or 1080P output, flexible aspect ratios, and durations from 3 to 15 seconds.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.14,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/alibaba-happyhorse-1.0-text-to-video.jpg"
    },
    atlasKey: "alibaba-happyhorse-1.0-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-happyhorse-1-0-text-to-video.mp4"
    }
  },
  {
    slug: "alibaba-happyhorse-1-0-image-to-video",
    name: "HappyHorse-1.0 Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Animates a first-frame image into video with optional prompt guidance, 720P or 1080P output, and durations from 3 to 15 seconds.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.14,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/alibaba-happyhorse-1.0-image-to-video.jpg"
    },
    atlasKey: "alibaba-happyhorse-1.0-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-happyhorse-1-0-image-to-video.mp4"
    }
  },
  {
    slug: "alibaba-happyhorse-1-0-reference-to-video",
    name: "HappyHorse-1.0 Reference-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text"],
    tags: ["image","REFERENCE-TO-VIDEO"],
    description: "Generates videos from one to nine reference images and a text prompt, supporting 720P or 1080P output, flexible aspect ratios, and durations from 3 to 15 seconds.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.14,
        unit: "second"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/alibaba-happyhorse-1.0-reference-to-video.jpg"
    },
    atlasKey: "alibaba-happyhorse-1.0-reference-to-video",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-happyhorse-1-0-reference-to-video.mp4"
    }
  },
  {
    slug: "alibaba-happyhorse-1-0-video-edit",
    name: "HappyHorse-1.0 Video-edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Edits an input video with text instructions and optional reference images, supporting 720P or 1080P output.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.14,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/alibaba-happyhorse-1.0-video-edit.jpg"
    },
    atlasKey: "alibaba-happyhorse-1.0-video-edit",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-happyhorse-1-0-video-edit.mp4"
    }
  },
  {
    slug: "openai-gpt-image-2-text-to-image",
    name: "Openai GPT Image 2 Text-to-Image",
    vendor: "Other",
    vendorSlug: "other",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","PREVIEW"],
    description: "GPT Image 2 text to image is OpenAI's fast, cost-efficient text-to-image generator powered by GPT-5 guidance. Create photorealistic shots, product renders, concept art, and stylized graphics from natural-language prompts (optionally conditioned with an image). Supports custom aspect ratios, seeds, negative prompts, hex color hints, and style presets. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.009,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-2-text-to-image.jpg"
    },
    atlasKey: "openai-gpt-image-2-text-to-image",
    accent: "from-blue-500 to-indigo-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-2-text-to-image.jpg"
    }
  },
  {
    slug: "openai-gpt-image-2-edit",
    name: "Openai GPT Image 2 Edit",
    vendor: "Other",
    vendorSlug: "other",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","PREVIEW"],
    description: "GPT Image 2 Edit is OpenAI's image model for precise, natural-language edits. Add/remove objects, swap backgrounds, retouch faces, adjust colors/lighting, edit text/graphics, crop/resize, and apply hex color control. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.01,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-2-edit.jpg"
    },
    atlasKey: "openai-gpt-image-2-edit",
    accent: "from-blue-500 to-indigo-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-2-edit.jpg"
    }
  },
  {
    slug: "baidu-ernie-image-turbo-text-to-image",
    name: "Baidu ERNIE Image Turbo Text-to-image",
    vendor: "Independent",
    vendorSlug: "independent",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","FREE"],
    description: "A fast, low-latency version of ERNIE Image by Baidu, optimized for rapid iteration and scalable image generation.Balances speed and quality, ideal for real-time and high-throughput scenarios.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.01,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/baidu-ernie-image-turbo-text-to-image.jpg"
    },
    atlasKey: "baidu-ERNIE-Image-Turbo-text-to-image",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/baidu-ernie-image-turbo-text-to-image.png"
    }
  },
  {
    slug: "bytedance-seedance-2-0-text-to-video",
    name: "Seedance 2.0 Text-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","AUDIO"],
    description: "Generate videos from text prompts with native audio and optional web search.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.096,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-text-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-2-0-image-to-video",
    name: "Seedance 2.0 Image-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","AUDIO"],
    description: "Generate videos from a first-frame image (and optional last-frame) with native audio.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.096,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-image-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-image-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-2-0-reference-to-video",
    name: "Seedance 2.0 Reference-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","AUDIO"],
    description: "Multimodal video generation from reference images, videos, and audio. Supports video editing and extension.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.096,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-reference-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-reference-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-reference-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-2-0-fast-text-to-video",
    name: "Seedance 2.0 Fast Text-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","AUDIO"],
    description: "Fast video generation from text prompts with native audio.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.076,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-fast-text-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-fast-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-fast-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-2-0-fast-image-to-video",
    name: "Seedance 2.0 Fast Image-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Fast video generation from first-frame image (and optional last-frame) with native audio.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.076,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-fast-image-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-fast-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-fast-image-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-2-0-fast-reference-to-video",
    name: "Seedance 2.0 Fast Reference-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","AUDIO"],
    description: "Fast multimodal video generation from reference images, videos, and audio. Supports video editing and extension.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.076,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bytedance-seedance-2.0-fast-reference-to-video.jpg"
    },
    atlasKey: "bytedance-seedance-2.0-fast-reference-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-2-0-fast-reference-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-7-text-to-video",
    name: "Wan-2.7 Text-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Generates videos from text prompts with multi-shot narrative, audio generation, and sound-image synchronization.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.1,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a649e94d-cbcb-416b-93b4-fbd21ec9549a.png"
    },
    atlasKey: "alibaba-wan-2.7-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-7-text-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-7-image-to-video",
    name: "Wan-2.7 Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Animates images into videos with first-frame, first-and-last-frame, video continuation, and audio-driven modes.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.1,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8088eae8-46ad-499c-853e-c2ddd15d70c6.png"
    },
    atlasKey: "alibaba-wan-2.7-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-7-image-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-7-reference-to-video",
    name: "Wan-2.7 Reference-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Generates character-driven videos from reference images and videos, with multi-subject and voice-cloning support.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.1,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c8a2d583-033f-4946-b68d-e5c7a2c2bcff.png"
    },
    atlasKey: "alibaba-wan-2.7-reference-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-7-reference-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-7-video-edit",
    name: "Wan-2.7 Video-edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Edits videos using text instructions, reference images, and style transfer with multi-modal input support.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.1,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a1acd1c4-a8c5-48e0-b57b-1b43ad67b7b4.png"
    },
    atlasKey: "alibaba-wan-2.7-video-edit",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-7-video-edit.mp4"
    }
  },
  {
    slug: "google-veo3-1-lite-text-to-video",
    name: "Veo 3.1 Lite Text-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "High-efficiency Veo 3.1 Lite text-to-video: create video with synchronized audio from text prompts. Targets high-volume applications with strong price efficiency; 720p/1080p and flexible duration options. Does not support 4K outputs or Extension.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.05,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/google-veo3.1-lite-text-to-video.jpg"
    },
    atlasKey: "google-veo3.1-lite-text-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-lite-text-to-video.f4v"
    }
  },
  {
    slug: "google-veo3-1-lite-start-end-frame-to-video",
    name: "Veo 3.1 Lite Start-End Frame to Video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Veo 3.1 Lite start-end frame to video: generate motion between a first and last frame with audio. Lightweight, developer-oriented option with 8s duration and 720p/1080p. Does not support 4K outputs or Extension.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.05,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/google-veo3.1-lite-start-end-frame-to-video.jpg"
    },
    atlasKey: "google-veo3.1-lite-start-end-frame-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-lite-start-end-frame-to-video.mp4"
    }
  },
  {
    slug: "google-veo3-1-lite-image-to-video",
    name: "Veo 3.1 Lite Image-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "High-efficiency Veo 3.1 Lite image-to-video: animate an input image into video with synchronized audio. Cost-effective for scalable workflows; supports 720p/1080p and common aspect ratios. Does not support 4K outputs or Extension.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.05,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/google-veo3.1-lite-image-to-video.jpg"
    },
    atlasKey: "google-veo3.1-lite-image-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-lite-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-spicy-image-to-video-lora",
    name: "Wan-2.2-turbo-spicy Image-to-video Lora",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Fast image-to-video generation with custom LoRA support. Powered by Wan 2.2 rCM turbo with high/low noise LoRA injection. Supports 480p, 720p, and 1080p output.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.026,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/76508744-f3ff-4f3a-a6b6-e70bd74ce605.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-spicy-image-to-video-lora",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-spicy-image-to-video-lora.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-spicy-image-to-video",
    name: "Wan-2.2-turbo-spicy Image-to-video",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Fast image-to-video generation powered by Wan 2.2 with rCM turbo acceleration. Supports 480p, 720p, and 1080p (via VSR upscaling) output with 5s or 8s duration.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: true,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bbd2f7a9-10ba-4d30-b944-99f82a92a046.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-spicy-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-spicy-image-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-7-text-to-image",
    name: "Wan-2.7 Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Generates images from text prompts with Wan 2.7 image, supporting fast iteration and strong prompt fidelity for illustration and photorealistic outputs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.03,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/5d03a56f-a412-4ef1-9568-002bdadccc56.png"
    },
    atlasKey: "alibaba-wan-2.7-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-7-text-to-image.png"
    }
  },
  {
    slug: "alibaba-wan-2-7-image-edit",
    name: "Wan-2.7 Image-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Edits and recomposes images with Wan 2.7 image using text instructions, multi-image references, and optional interaction boxes.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.03,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c1156456-7e5c-4a37-a1b5-968b1da8ee7e.png"
    },
    atlasKey: "alibaba-wan-2.7-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-7-image-edit.png"
    }
  },
  {
    slug: "alibaba-wan-2-7-pro-text-to-image",
    name: "Wan-2.7 Pro Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT","PRO"],
    description: "Generates images from text prompts with Wan 2.7 image pro, supporting higher fidelity outputs and 4K-ready workflows.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.075,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/fb397a67-c033-44d7-8f29-9b97833ebafc.png"
    },
    atlasKey: "alibaba-wan-2.7-pro-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-7-pro-text-to-image.png"
    }
  },
  {
    slug: "alibaba-wan-2-7-pro-image-edit",
    name: "Wan-2.7 Pro Image-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT","PRO"],
    description: "Edits and recomposes images with Wan 2.7 image pro using text instructions and multi-image references for higher quality outputs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.075,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/25232e61-eb50-4565-9f84-61254ed908bd.png"
    },
    atlasKey: "alibaba-wan-2.7-pro-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-7-pro-image-edit.png"
    }
  },
  {
    slug: "google-nano-banana-2-text-to-image",
    name: "Nano Banana 2 Text-to-Image",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's lightweight yet powerful AI image generation model, built for creators who need fast, high-quality visuals from simple text prompts.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/e3d79fcd-e562-4356-92be-741000f0b081.png"
    },
    atlasKey: "google-nano-banana-2-text-to-image",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-2-text-to-image.png"
    }
  },
  {
    slug: "google-nano-banana-2-edit",
    name: "Nano Banana 2 Edit",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Google's advanced AI-powered image editing and generation model, designed to make visual transformation as intuitive as describing it in words.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/5ffcc819-33cc-4d8f-9d1a-fc2ba3e1c49a.png"
    },
    atlasKey: "google-nano-banana-2-edit",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-2-edit.png"
    }
  },
  {
    slug: "qwen-qwen-image-2-0-text-to-image",
    name: "Qwen Image 2.0 Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Qwen Image 2.0 is an advanced text-to-image model with enhanced image quality and improved prompt understanding. Up to 2k. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.028,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/qwen-qwen-image-2.0-text-to-image.jpg"
    },
    atlasKey: "qwen-qwen-image-2.0-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/qwen-qwen-image-2-0-text-to-image.png"
    }
  },
  {
    slug: "qwen-qwen-image-2-0-edit",
    name: "Qwen Image 2.0 Edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Qwen Image 2.0 Edit is an advanced image-editing model with improved quality and better understanding of instructions. Up to 2k. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.028,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/qwen-qwen-image-2.0-edit.jpg"
    },
    atlasKey: "qwen-qwen-image-2.0-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/qwen-qwen-image-2-0-edit.png"
    }
  },
  {
    slug: "qwen-qwen-image-2-0-pro-edit",
    name: "Qwen Image 2.0 Pro Edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Qwen Image 2.0 Pro Edit is a professional-grade image editing model with superior quality and advanced instruction understanding. Up to 2k. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/qwen-qwen-image-2.0-pro-edit.jpg"
    },
    atlasKey: "qwen-qwen-image-2.0-pro-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/qwen-qwen-image-2-0-pro-edit.png"
    }
  },
  {
    slug: "qwen-qwen-image-2-0-pro-text-to-image",
    name: "Qwen Image 2.0 Pro Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Qwen Image 2.0 Pro is a professional-grade text-to-image model with superior quality and advanced prompt understanding. Up to 2k. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/qwen-qwen-image-2.0-pro-text-to-image.jpg"
    },
    atlasKey: "qwen-qwen-image-2.0-pro-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/qwen-qwen-image-2-0-pro-text-to-image.png"
    }
  },
  {
    slug: "bytedance-seedream-v5-0-lite-edit-sequential",
    name: "Seedream v5.0 Lite Edit Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "ByteDance next-generation image editing model with batch generation support. Edit multiple images while preserving facial features and details.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b9b97981-2feb-4033-b91c-10fb6fa29fca.png"
    },
    atlasKey: "bytedance-seedream-v5.0-lite-edit-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v5-0-lite-edit-sequential.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v5-0-lite-sequential",
    name: "Seedream v5.0 Lite Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "ByteDance next-generation image model with batch generation support. Generate up to 15 related images in a single request.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1187d6b5-6c80-4de0-b22a-15327c450168.png"
    },
    atlasKey: "bytedance-seedream-v5.0-lite-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v5-0-lite-sequential.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v5-0-lite-edit",
    name: "Seedream v5.0 Lite Edit",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "ByteDance next-generation image editing model that preserves facial features, lighting, and color tones while enabling professional-quality modifications.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/16a9bd87-e058-4d4d-9242-045c368005c0.png"
    },
    atlasKey: "bytedance-seedream-v5.0-lite-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v5-0-lite-edit.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v5-0-lite",
    name: "Seedream v5.0 Lite",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "ByteDance next-generation image model with enhanced quality, typography, and poster design. Supports PNG output and fast prompt optimization mode.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/79b9aa97-b53f-4953-9a31-10d48f1f1585.png"
    },
    atlasKey: "bytedance-seedream-v5.0-lite",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v5-0-lite.jpeg"
    }
  },
  {
    slug: "google-veo3-1-fast-image-to-video",
    name: "Veo3.1 Fast Image-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Bring still images to life with smooth, expressive motion. Veo 3.1 Image-to-Video transforms photos or keyframes into cinematic video sequences with realistic continuity and sound.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.08,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/6df566f3-053a-444b-8f58-9ed386158c3d.png"
    },
    atlasKey: "google-veo3.1-fast-image-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-fast-image-to-video.mp4"
    }
  },
  {
    slug: "google-veo3-1-fast-text-to-video",
    name: "Veo3.1 Fast Text-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Generate visually compelling videos from text in record time. Veo 3.1 Fast Text-to-Video prioritizes speed and responsiveness while maintaining impressive fidelity for rapid creative iteration.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.08,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/f3f8cd70-0984-4e98-93e1-8fe21bdcf9f7.png"
    },
    atlasKey: "google-veo3.1-fast-text-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-fast-text-to-video.mp4"
    }
  },
  {
    slug: "google-veo3-1-image-to-video",
    name: "Veo3.1 Image-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Quickly animate static images into motion-rich, high-quality clips. Veo 3.1 Fast Image-to-Video accelerates rendering for fast previews and iterative visual storytelling.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.2,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/35750b4a-c8d3-4bce-8e6a-bf2216275b50.png"
    },
    atlasKey: "google-veo3.1-image-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-image-to-video.mp4"
    }
  },
  {
    slug: "google-veo3-1-reference-to-video",
    name: "Veo3.1 Reference-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Create richly detailed videos guided by visual references. Veo 3.1 Reference-to-Video preserves characters, style, and composition across scenes for consistent, visually coherent storytelling.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.2,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c06f8fde-42ee-4d8f-aa58-f50713b06be8.png"
    },
    atlasKey: "google-veo3.1-reference-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-reference-to-video.mp4"
    }
  },
  {
    slug: "google-veo3-1-text-to-video",
    name: "Veo3.1 Text-to-video",
    vendor: "Google",
    vendorSlug: "google",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Generate high-fidelity videos from text prompts with Googleâ€™s most advanced generative video model. Veo 3.1 delivers cinematic quality, dynamic camera motion, and lifelike detail for storytelling and creative production.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.2,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8d7ac6f5-cf47-4786-a032-ff8b54b96ea1.png"
    },
    atlasKey: "google-veo3.1-text-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/google-veo3-1-text-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-image-to-video",
    name: "Wan 2.2 Turbo Image-to-Video",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video model for fast single-clip generation with stable motion and 30fps workflow post-processing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a2f9067a-a769-4a33-a7e0-2a9e745ae944.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-infinite-image-to-video",
    name: "Wan 2.2 Turbo Infinite Image-to-Video",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video model for segmented prompt video generation with stable motion and 30fps workflow post-processing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8ca725d8-10b0-4f45-ad8f-93bbd1d19e3a.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-infinite-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-infinite-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-infinite-image-to-video-lora",
    name: "Wan 2.2 Turbo Infinite Image-to-Video LoRA",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video LoRA variant for segmented prompt video generation with stable motion and 30fps workflow post-processing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.026,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/14b5c4dd-3462-4d03-b898-28e6a5d89d1c.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-infinite-image-to-video-lora",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-infinite-image-to-video-lora.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-spicy-infinite-image-to-video",
    name: "Wan 2.2 Turbo Spicy Infinite Image-to-Video",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video model for segmented prompt video generation with stable motion and 30fps workflow post-processing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/9e0aa956-d2fe-43af-bd00-917786c398dd.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-spicy-infinite-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-spicy-infinite-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-turbo-spicy-infinite-image-to-video-lora",
    name: "Wan 2.2 Turbo Spicy Infinite Image-to-Video LoRA",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video LoRA variant for segmented prompt video generation with stable motion and 30fps workflow post-processing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.026,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1c081949-f22b-4c8d-bd22-71906d6e7951.png"
    },
    atlasKey: "atlascloud-wan-2.2-turbo-spicy-infinite-image-to-video-lora",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-turbo-spicy-infinite-image-to-video-lora.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-image-to-video",
    name: "Wan-2.2 Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.03,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/atlascloud-wan-2.2-image-to-video.jpg"
    },
    atlasKey: "atlascloud-wan-2.2-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-wan-2-2-image-to-video-lora",
    name: "Wan-2.2 Image-to-video Lora",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.04,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/atlascloud-wan-2.2-image-to-video-lora.jpg"
    },
    atlasKey: "atlascloud-wan-2.2-image-to-video-lora",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-wan-2-2-image-to-video-lora.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-2-spicy-image-to-video-lora",
    name: "Wan-2.2-spicy Image-to-video Lora",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.04,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bb4a18ae-e1dc-4954-8507-6d57445da5ec.png"
    },
    atlasKey: "alibaba-wan-2.2-spicy-image-to-video-lora",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-spicy-image-to-video-lora.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-2-spicy-image-to-video",
    name: "Wan-2.2-spicy Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.03,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/afcc5aec-94fa-4303-8878-61826434696d.png"
    },
    atlasKey: "alibaba-wan-2.2-spicy-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-spicy-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-video-upscaler",
    name: "Video Upscaler",
    vendor: "Atlas Cloud",
    vendorSlug: "atlas-cloud",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Upscale an existing video to 1080p or 2K while preserving motion, timing, and source composition. 4K support is planned for a later release.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.018,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/atlascloud-video-upscaler.jpg"
    },
    atlasKey: "atlascloud-video-upscaler",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-video-upscaler.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v3-0-std-image-to-video",
    name: "Kling v3.0 Std Image-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling v3.0 Standard Image-to-Video model by Kuaishou. High-quality video generation from images.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/882de690-babe-4578-8dd0-3e2aedef41cb.png"
    },
    atlasKey: "kwaivgi-kling-v3.0-std-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v3-0-std-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v3-0-pro-image-to-video",
    name: "Kling v3.0 Pro Image-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","PRO"],
    description: "Kling v3.0 Professional Image-to-Video model by Kuaishou. Premium quality video generation from images with advanced features.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1ab26565-a8a2-4294-a40f-c1249f73fc43.png"
    },
    atlasKey: "kwaivgi-kling-v3.0-pro-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v3-0-pro-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v3-0-pro-text-to-video",
    name: "Kling v3.0 Pro Text-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","PRO"],
    description: "Kling v3.0 Professional Text-to-Video model by Kuaishou. Premium quality video generation from text prompts with advanced features.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8c1c17dd-3adc-4b5e-8568-5b003fc58d4b.png"
    },
    atlasKey: "kwaivgi-kling-v3.0-pro-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v3-0-pro-text-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v3-0-std-text-to-video",
    name: "Kling v3.0 Std Text-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Kling v3.0 Standard Text-to-Video model by Kuaishou. High-quality video generation from text prompts.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/4107adb3-cc2f-4014-a52a-dbc9a4cff52d.png"
    },
    atlasKey: "kwaivgi-kling-v3.0-std-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v3-0-std-text-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-pro-avatar",
    name: "Kling v2.6 Pro Avatar",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling V2 AI Avatar Pro generates high-quality AI avatar videos with clean detail, stable motion, and strong identity consistencyâ€”ideal for profiles, intros, and social content.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1361f730-deef-490a-9829-cd4146e6b7ed.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-pro-avatar",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-pro-avatar.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-std-avatar",
    name: "Kling v2.6 Std Avatar",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling AI Avatar generates high-quality AI avatar videos for profiles, intros, and social content, delivering clean detail and cinematic motion with reliable prompt adherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/fbe42444-bc15-45b7-bacf-fd7a49e0ccdb.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-std-avatar",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-std-avatar.mp4"
    }
  },
  {
    slug: "openai-gpt-image-1-5-text-to-image",
    name: "Openai GPT Image-1.5 Text-to-image",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "GPT Image 1.5 text to image is OpenAIâ€™s fast, cost-efficient text-to-image generator powered by GPT-5 guidance. Create photorealistic shots, product renders, concept art, and stylized graphics from natural-language prompts (optionally conditioned with an image). Supports custom aspect ratios, seeds, negative prompts, hex color hints, and style presets. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.008,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1.5-text-to-image.jpg"
    },
    atlasKey: "openai-gpt-image-1.5-text-to-image",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-5-text-to-image.png"
    }
  },
  {
    slug: "openai-gpt-image-1-5-edit",
    name: "Openai GPT Image-1.5 Edit",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "GPT Image 1.5 Edit is OpenAIâ€™s image model for precise, natural-language edits. Add/remove objects, swap backgrounds, retouch faces, adjust colors/lighting, edit text/graphics, crop/resize, and apply hex color control. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.008,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1.5-edit.jpg"
    },
    atlasKey: "openai-gpt-image-1.5-edit",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-5-edit.png"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-pro-motion-control",
    name: "Kling v2.6 Pro Motion Control",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling 2.6 Pro Motion Control turns reference motion clips (dance, action, gesture) into smooth, realistic animations. Upload a character image (or source video) and a motion video; the model transfers the movement while preserving identity and temporal consistency.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1dab7748-83fe-4f2e-9f5b-ad9975751c22.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-pro-motion-control",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-pro-motion-control.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-std-motion-control",
    name: "Kling v2.6 Std Motion Control",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling 2.6 Standard Motion Control transfers motion from reference videos to animate still images. Upload a character image and a motion clip (dance, action, gesture), and the model extracts the movement to generate smooth, realistic video.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/66a372af-c8d9-4c9b-88c6-995ec9361517.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-std-motion-control",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-std-motion-control.mp4"
    }
  },
  {
    slug: "alibaba-qwen-image-edit-plus-20251215",
    name: "Qwen-Image Edit Plus 20251215",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Supports multiple image inputs and outputs, allowing for precise modification of text within images, addition, deletion, or movement of objects, alteration of subject actions, transfer of image styles, and enhancement of image details.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1ce6bd0e-8c1e-4f31-9901-176238bf8064.png"
    },
    atlasKey: "alibaba-qwen-image-edit-plus-20251215",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-qwen-image-edit-plus-20251215.webp"
    }
  },
  {
    slug: "alibaba-wan-2-6-image-to-video-flash",
    name: "Wan-2.6 Image-to-video Flash",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Wan2.6 image to video flash, faster and more cost-effective generation. Intelligent shot scheduling enables multiâ€‘camera storytelling, supports stable multiâ€‘speaker dialogue with more natural and realistic vocal timbres.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.018,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/792a59b5-c776-4d80-8787-9a7ec5d769fd.png"
    },
    atlasKey: "alibaba-wan-2.6-image-to-video-flash",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-6-image-to-video-flash.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-5-pro-image-to-video",
    name: "Seedance v1.5 Pro Image-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Native audio-visual joint generation model by ByteDance. Supports unified multimodal generation with precise audio-visual sync, cinematic camera control, and enhanced narrative coherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.047,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1535e43d-fcd2-4f19-af66-68806acd60dc.png"
    },
    atlasKey: "bytedance-seedance-v1.5-pro-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-5-pro-image-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-5-pro-text-to-video",
    name: "Seedance v1.5 Pro Text-to-Video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Native audio-visual joint generation model by ByteDance. Supports unified multimodal generation with precise audio-visual sync, cinematic camera control, and enhanced narrative coherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.047,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/2868101b-f4fc-4383-b305-281fbc8fc260.png"
    },
    atlasKey: "bytedance-seedance-v1.5-pro-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-5-pro-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-5-pro-image-to-video-fast",
    name: "Seedance v1.5 Pro Image-to-Video Fast",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Native audio-visual joint generation model by ByteDance. Supports unified multimodal generation with precise audio-visual sync, cinematic camera control, and enhanced narrative coherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.018,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/2045a170-5a4f-4f6c-a533-a0182c787290.png"
    },
    atlasKey: "bytedance-seedance-v1.5-pro-image-to-video-fast",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-5-pro-image-to-video-fast.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-6-image-edit",
    name: "Wan-2.6 Image-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Supports image editing and mixed text and image output to meet diverse generation and integration needs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/271ec1bd-6684-4b91-b122-e896c331d446.png"
    },
    atlasKey: "alibaba-wan-2.6-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-6-image-edit.png"
    }
  },
  {
    slug: "alibaba-wan-2-6-image-to-video",
    name: "Wan-2.6 Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "A speed-optimized image-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.07,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b208992e-ef0b-4d48-bc56-24b86367a4b4.png"
    },
    atlasKey: "alibaba-wan-2.6-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-6-image-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-6-video-to-video",
    name: "Wan-2.6 Video-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "A speed-optimized video-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.07,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/7e1f592a-db74-4bef-add5-d4fe65e9e490.png"
    },
    atlasKey: "alibaba-wan-2.6-video-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-6-video-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-6-text-to-video",
    name: "Wan-2.6 Text-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "A speed-optimized text-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.07,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/0e2a70b7-a3b2-4772-8021-3df66966ed39.png"
    },
    atlasKey: "alibaba-wan-2.6-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-6-text-to-video.mp4"
    }
  },
  {
    slug: "z-image-turbo",
    name: "Z-Image Turbo",
    vendor: "Tongyi Mai",
    vendorSlug: "tongyi-mai",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Z-Image-Turbo is a 6 billion parameter text-to-image model that generates photorealistic images in sub-second time. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.01,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/7a08e510-c9e1-4c70-ba5d-61218f10bcaf.png"
    },
    atlasKey: "z-image-turbo",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/z-image-turbo.png"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-pro-video-edit",
    name: "Kling Video O3 Pro Video-Edit",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video","VIDEO-EDIT","PRO"],
    description: "Kling Omni Video O3 Video-Edit enables conversational video editing through natural language commands. Professional quality with object removal/replacement, background changes, and effects.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.143,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1d85384e-fc2f-4273-bd5b-40c1b693b682.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-pro-video-edit",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-pro-video-edit.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-pro-reference-to-video",
    name: "Kling Video O3 Pro Reference-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","REFERENCE-TO-VIDEO","PRO"],
    description: "Kling Omni Video O3 Reference-to-Video generates creative videos using character, prop, or scene references. Professional quality with up to 7 reference images and optional video input.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/3da34d2a-ab97-43ed-b3f9-0ac9111f8aa0.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-pro-reference-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-pro-reference-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-pro-image-to-video",
    name: "Kling Video O3 Pro Image-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","PRO"],
    description: "Kling Omni Video O3 Image-to-Video transforms static images into dynamic cinematic videos using MVL technology. Professional quality with first/last frame control and audio generation.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/0d9b2431-731c-4364-963b-573da304f5f9.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-pro-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-pro-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-pro-text-to-video",
    name: "Kling Video O3 Pro Text-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","PRO"],
    description: "Kling Omni Video O3 is Kuaishou's advanced unified multi-modal video model with MVL (Multi-modal Visual Language) technology. Professional quality with enhanced motion and detail.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/985e292c-704f-49f1-bdf1-98b1ae585912.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-pro-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-pro-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-5-pro-text-to-video-fast",
    name: "Seedance v1.5 Pro Text-to-Video Fast",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","FAST"],
    description: "Native audio-visual joint generation model by ByteDance. Supports unified multimodal generation with precise audio-visual sync, cinematic camera control, and enhanced narrative coherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.018,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a5c52adf-5bfd-4bf4-bd76-c6bf48ea2664.png"
    },
    atlasKey: "bytedance-seedance-v1.5-pro-text-to-video-fast",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-5-pro-text-to-video-fast.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-pro-text-to-video",
    name: "Kling v2.6 Pro Text-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Latest text-to-video model from Kuaishou with sound generation, flexible aspect ratios, and cinematic quality.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/0b5f5e74-9252-4ffb-aedf-42f67492bd33.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-pro-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-pro-text-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-6-pro-image-to-video",
    name: "Kling v2.6 Pro Image-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Latest image-to-video model from Kuaishou with sound generation, enhanced dynamics, and cinematic quality.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bc06c628-107e-4dd5-94e9-13172ff253e2.png"
    },
    atlasKey: "kwaivgi-kling-v2.6-pro-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-6-pro-image-to-video.mp4"
    }
  },
  {
    slug: "openai-gpt-image-1-text-to-image",
    name: "Openai GPT Image-1 Text-to-image",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "OpenAI GPT Image-1 generates images from text prompts from OpenAI's latest text-to-image model, ideal for creating visual assets. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.009,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1-text-to-image.jpg"
    },
    atlasKey: "openai-gpt-image-1-text-to-image",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-text-to-image.png"
    }
  },
  {
    slug: "openai-gpt-image-1-edit",
    name: "Openai GPT Image-1 Edit",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "OpenAI's gpt-image-1 enables image generation and image editing via OpenAI's image API, ideal for creating and refining images. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.009,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1-edit.jpg"
    },
    atlasKey: "openai-gpt-image-1-edit",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-edit.png"
    }
  },
  {
    slug: "openai-gpt-image-1-mini-text-to-image",
    name: "Openai GPT Image-1 Mini Text-to-image",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "GPT Image 1 Mini is a cost-efficient multimodal OpenAI model powered by GPT-5 that turns text or image prompts into high-quality images. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.004,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1-mini-text-to-image.jpg"
    },
    atlasKey: "openai-gpt-image-1-mini-text-to-image",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-mini-text-to-image.png"
    }
  },
  {
    slug: "openai-gpt-image-1-mini-edit",
    name: "Openai GPT Image-1 Mini Edit",
    vendor: "OpenAI",
    vendorSlug: "openai",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "GPT Image 1 Mini is a cost-efficient, natively multimodal OpenAI model that pairs GPT-5 language understanding with compact image editing and generation from text and image inputs to produce high-quality images. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.004,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/openai-gpt-image-1-mini-edit.jpg"
    },
    atlasKey: "openai-gpt-image-1-mini-edit",
    accent: "from-violet-500 to-fuchsia-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/openai-gpt-image-1-mini-edit.png"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-std-video-edit",
    name: "Kling Video O3 Std Video-Edit",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video","VIDEO-EDIT"],
    description: "Kling Omni Video O3 Video-Edit (Standard) enables natural-language video edits: remove or replace objects, change backgrounds, add effects, and more. Video duration limited to 10s.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.107,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/2aadee11-6021-48b9-9090-60f352f1fca7.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-std-video-edit",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-std-video-edit.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-std-reference-to-video",
    name: "Kling Video O3 Std Reference-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","REFERENCE-TO-VIDEO"],
    description: "Kling Omni Video O3 (Standard) Reference-to-Video generates creative videos using character, prop, or scene references. Supports up to 7 reference images and optional video input.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/407f7f41-79b0-49d1-a9ca-16219a1bad42.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-std-reference-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-std-reference-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-std-image-to-video",
    name: "Kling Video O3 Std Image-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling Omni Video O3 (Standard) Image-to-Video transforms static images into dynamic cinematic videos using MVL technology. Supports first/last frame control and audio generation.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/98149337-dd6b-4918-ba95-bfdc58b0ae0f.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-std-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-std-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o3-std-text-to-video",
    name: "Kling Video O3 Std Text-to-Video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Kling Omni Video O3 (Standard) is Kuaishou's advanced unified multi-modal video model with MVL (Multi-modal Visual Language) technology. Generates high-quality videos from text prompts with natural motion and audio generation support.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/270e309c-21d0-428e-8ffd-366c1b98f3b7.png"
    },
    atlasKey: "kwaivgi-kling-video-o3-std-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o3-std-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedream-v4-5",
    name: "Seedream v4.5",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "ByteDance latest image generation model achieving all-round improvements. Excels at typography, poster design, and brand visual creation with superior prompt adherence.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.036,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/21f7f01d-916c-4159-a917-6c894590dada.png"
    },
    atlasKey: "bytedance-seedream-v4.5",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-5.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v4-5-edit",
    name: "Seedream v4.5 Edit",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "ByteDance advanced image editing model that preserves facial features, lighting, and color tones while enabling professional-quality modifications.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.036,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/62de6e64-1fa7-4a21-b39c-adfa4dbc9eb6.png"
    },
    atlasKey: "bytedance-seedream-v4.5-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-5-edit.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v4-5-sequential",
    name: "Seedream v4.5 Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "ByteDance latest image generation model with batch generation support. Generate up to 15 images in a single request.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.036,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c8186132-5fb2-4dd1-9345-63e4f74e17f4.png"
    },
    atlasKey: "bytedance-seedream-v4.5-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-5-sequential.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v4-5-edit-sequential",
    name: "Seedream v4.5 Edit Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "ByteDance advanced image editing model with batch generation support. Edit multiple images while preserving facial features and details.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.036,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b22f3d36-cc8a-4ce0-a2b3-b8201cab0d3c.png"
    },
    atlasKey: "bytedance-seedream-v4.5-edit-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-5-edit-sequential.jpeg"
    }
  },
  {
    slug: "kwaivgi-kling-video-o1-image-to-video",
    name: "Kling Video O1 Image-to-video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Kling Omni Video O1 Image-to-Video transforms static images into dynamic cinematic videos using MVL (Multi-modal Visual Language) technology. Maintains subject consistency while adding natural motion, physics simulation, and seamless scene dynamics. Ready-to-use REST API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/369c05a4-9a9a-483c-9f30-ad10e95fa863.png"
    },
    atlasKey: "kwaivgi-kling-video-o1-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o1-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-video-o1-text-to-video",
    name: "Kling Video O1 Text-to-video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Kling Omni Video O1 is Kuaishou's first unified multi-modal video model with MVL (Multi-modal Visual Language) technology. Text-to-Video mode generates cinematic videos from text prompts with subject consistency, natural physics simulation, and precise semantic understanding. Ready-to-use REST API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.095,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/e0313d37-eb6c-4188-aee3-4d2648c37317.png"
    },
    atlasKey: "kwaivgi-kling-video-o1-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-video-o1-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-5-pro-image-to-video-spicy",
    name: "Seedance v1.5 Pro Image-to-Video Spicy",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","ENHANCED"],
    description: "Seedance V1.5 Pro Spicy transforms images into high-quality cinematic video with smooth motion and expressive animations, optimized for creative content at scale.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.049,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a56f284b-409f-4594-9341-44cc66b18646.png"
    },
    atlasKey: "bytedance-seedance-v1.5-pro-image-to-video-spicy",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-5-pro-image-to-video-spicy.mp4"
    }
  },
  {
    slug: "atlascloud-qwen-image-edit",
    name: "Qwen Image Edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Qwen-Image-Edit â€” a 20B MMDiT model for next-gen image edit generation.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bf461318-0ef5-4c79-b8e6-394accec84da.png"
    },
    atlasKey: "atlascloud-qwen-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/atlascloud-qwen-image-edit.jpeg"
    }
  },
  {
    slug: "google-nano-banana-pro-text-to-image-ultra",
    name: "Nano Banana Pro Text-to-image Ultra",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Nano Banana Pro is the next-generation Nano Banana image model, delivering sharper detail, richer color control, and faster diffusion for production-ready visuals.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.15,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/897c848b-89be-442f-9e3d-2fb8865eb0e5.png"
    },
    atlasKey: "google-nano-banana-pro-text-to-image-ultra",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-pro-text-to-image-ultra.png"
    }
  },
  {
    slug: "google-nano-banana-pro-edit-ultra",
    name: "Nano Banana Pro Edit Ultra",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Nano Banana Pro Edit is an image editing tool built on the Nano Banana model family, designed for precise, AI-powered visual adjustments.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.15,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a14d069d-2460-4fde-9a35-a2f18405c6e1.png"
    },
    atlasKey: "google-nano-banana-pro-edit-ultra",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-pro-edit-ultra.png"
    }
  },
  {
    slug: "google-nano-banana-pro-text-to-image",
    name: "Nano Banana Pro Text-to-image",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Nano Banana Pro is the next-generation Nano Banana image model, delivering sharper detail, richer color control, and faster diffusion for production-ready visuals.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.084,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/7b1af8da-75c1-4b1a-9cc3-dff94b780e60.png"
    },
    atlasKey: "google-nano-banana-pro-text-to-image",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-pro-text-to-image.png"
    }
  },
  {
    slug: "alibaba-qwen-image-text-to-image-max",
    name: "Qwen-Image Text-to-image Max",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "General-purpose image generation model that supports various art styles and is particularly good at rendering complex text.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.052,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/94f8f06c-145b-45c5-af53-7a1f4637f4dc.png"
    },
    atlasKey: "alibaba-qwen-image-text-to-image-max",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-qwen-image-text-to-image-max.png"
    }
  },
  {
    slug: "alibaba-qwen-image-text-to-image-plus",
    name: "Qwen-Image Text-to-image Plus",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "General-purpose image generation model that supports various art styles and is particularly good at rendering complex text.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b3bd3956-df77-4bb1-b069-2f6a38a657d6.png"
    },
    atlasKey: "alibaba-qwen-image-text-to-image-plus",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-qwen-image-text-to-image-plus.png"
    }
  },
  {
    slug: "google-nano-banana-pro-edit",
    name: "Nano Banana Pro Edit",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Nano Banana Pro Edit is an image editing tool built on the Nano Banana model family, designed for precise, AI-powered visual adjustments.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.084,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bd1ceb16-7666-4f95-8c13-2f914e4a9333.png"
    },
    atlasKey: "google-nano-banana-pro-edit",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-pro-edit.png"
    }
  },
  {
    slug: "alibaba-wan-2-5-video-extend",
    name: "Wan-2.5 Video Extend",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Extend your videos with Alibaba WAN 2.5 video extender model with audio.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.052,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/6141b2a6-fe77-45dc-84b0-d9b05b10b24d.png"
    },
    atlasKey: "alibaba-wan-2.5-video-extend",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-5-video-extend.mp4"
    }
  },
  {
    slug: "minimax-hailuo-2-3-t2v-standard",
    name: "Hailuo-2.3 t2v Standard",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "High-quality text-to-video generation optimized for creative workflows with cinematic visuals and reliable prompt fidelity.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.28,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/6b868ad8-1774-4492-bae0-f6de3f038d58.png"
    },
    atlasKey: "minimax-hailuo-2.3-t2v-standard",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-2-3-t2v-standard.mp4"
    }
  },
  {
    slug: "minimax-hailuo-2-3-t2v-pro",
    name: "Hailuo-2.3 t2v Pro",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Professional-grade text-to-video model delivering advanced motion, physics realism and film-style output for VFX and marketing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.49,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a740482a-4de9-48d6-8dd7-b896e575b271.png"
    },
    atlasKey: "minimax-hailuo-2.3-t2v-pro",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-2-3-t2v-pro.mp4"
    }
  },
  {
    slug: "minimax-hailuo-2-3-i2v-standard",
    name: "Hailuo-2.3 i2v Standard",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Image-to-video conversion model offering efficient animation from stills with consistent style and smooth motion.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.28,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1e88764a-04c6-4c18-bf35-f9e3e40e0848.png"
    },
    atlasKey: "minimax-hailuo-2.3-i2v-standard",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-2-3-i2v-standard.mp4"
    }
  },
  {
    slug: "minimax-hailuo-2-3-i2v-pro",
    name: "Hailuo-2.3 i2v Pro",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Premium image-to-video model designed for detailed scene evolution, character continuity and high-fidelity animation.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.49,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/2fa095fd-acfc-4d3b-9bfa-b4357e41caa9.png"
    },
    atlasKey: "minimax-hailuo-2.3-i2v-pro",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-2-3-i2v-pro.mp4"
    }
  },
  {
    slug: "minimax-hailuo-2-3-fast",
    name: "Hailuo-2.3 Fast",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Speed-optimized variant of Hailuo-2.3 delivering rapid video generation while maintaining strong visual quality for quick iterations.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.19,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/23a32cd4-c067-4f95-9370-ca8c3cc3a854.png"
    },
    atlasKey: "minimax-hailuo-2.3-fast",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-2-3-fast.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-fast-text-to-video",
    name: "Seedance v1 Pro Fast Text-to-video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "An efficient text-to-video model geared toward fast, cost-effective generation. Ideal for prototyping short narrative clips (2â€“12 s) with stylistic flexibility and prompt-faithful motion.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.009,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/fb5e1a16-3c4f-49c8-a1fb-eb85de966113.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-fast-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-fast-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-fast-image-to-video",
    name: "Seedance v1 Pro Fast Image-to-video",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Seedance Proâ€™s image-to-video mode transforms still visuals into cinematic motion, maintaining visual consistency and expressive animation across frames.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.009,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/f36afa59-44a4-4411-940d-7e397ff567a5.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-fast-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-fast-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-5-turbo-pro-text-to-video",
    name: "Kling v2.5 Turbo Pro Text-to-video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Delivers high-speed text-to-video generation with cinematic motion precision and enhanced temporal stability.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1c354eef-76e6-4b58-b81d-04bfc4916307.png"
    },
    atlasKey: "kwaivgi-kling-v2.5-turbo-pro-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-5-turbo-pro-text-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-5-turbo-pro-image-to-video",
    name: "Kling v2.5 Turbo Pro Image-to-video",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Transforms stills into lifelike video clips at 2Ã— faster speed while preserving fine texture and lighting consistency.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/295b736e-7298-4a1f-8d6f-fbde80e33251.png"
    },
    atlasKey: "kwaivgi-kling-v2.5-turbo-pro-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-5-turbo-pro-image-to-video.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-1-i2v-pro-start-end-frame",
    name: "Kling v2.1 i2v Pro Start-end-frame",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Supports start-to-end frame conditioning for controlled motion continuity and smoother scene transitions.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.083,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8e516b13-71bd-458f-9539-ba7eccfe4fde.png"
    },
    atlasKey: "kwaivgi-kling-v2.1-i2v-pro-start-end-frame",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-1-i2v-pro-start-end-frame.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v1-6-multi-i2v-pro",
    name: "Kling v1.6 Multi i2v Pro",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Generates multi-subject video from images with improved coherence and advanced motion-tracking accuracy.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.083,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/938528e7-0d0f-4fbc-9875-77aab0d32d88.png"
    },
    atlasKey: "kwaivgi-kling-v1.6-multi-i2v-pro",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v1-6-multi-i2v-pro.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v1-6-multi-i2v-standard",
    name: "Kling v1.6 Multi i2v Standard",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "A cost-efficient option for basic image-to-video generation with balanced speed and detail.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/76faeacf-ed38-4145-b838-4ee8ba451c58.png"
    },
    atlasKey: "kwaivgi-kling-v1.6-multi-i2v-standard",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v1-6-multi-i2v-standard.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-effects",
    name: "Kling Effects",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Adds post-processing and stylistic motion effects, expanding creative editing within Klingâ€™s video suite.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.212,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/db64ed33-72ae-4c20-a9ee-e188d2d3e574.png"
    },
    atlasKey: "kwaivgi-kling-effects",
    accent: "from-rose-500 to-red-500"
  },
  {
    slug: "atlascloud-van-2-6-text-to-video",
    name: "Van-2.6 Text-to-video",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "A speed-optimized text-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.068,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/630fd899-0d3e-4f4d-9daf-f30cf42e5b1e.png"
    },
    atlasKey: "atlascloud-van-2.6-text-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-van-2-6-text-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-5-text-to-video-fast",
    name: "Wan-2.5 Text-to-video Fast",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Convert prompts into cinematic video clips with synchronized sound. Wan 2.5 generates 480p/720p/1080p outputs with stable motion, native audio sync, and prompt-faithful visual storytelling.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a5c63327-d597-43d5-b0fb-b0da51d02cde.png"
    },
    atlasKey: "alibaba-wan-2.5-text-to-video-fast",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-5-text-to-video-fast.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-5-text-to-video",
    name: "Wan-2.5 Text-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "A speed-optimized text-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.035,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/5d49606e-c353-4e9f-b2d1-6975cb8f3db0.png"
    },
    atlasKey: "alibaba-wan-2.5-text-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-5-text-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-5-image-to-video",
    name: "Wan-2.5 Image-to-video",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Bring static images to life with dynamic motion, lighting consistency, and synchronized audio. This variant smoothly animates reference visuals into short video sequences.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.035,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/e230292a-464f-4dda-9d9b-0d332bdd0caa.png"
    },
    atlasKey: "alibaba-wan-2.5-image-to-video",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-5-image-to-video.mp4"
    }
  },
  {
    slug: "atlascloud-van-2-6-image-to-video",
    name: "Van-2.6 Image-to-video",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "A speed-optimized image-to-video option that prioritizes lower latency while retaining strong visual fidelity. Ideal for iteration, batch generation, and prompt testing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.068,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/4aed85a0-a71d-433e-bd10-189a9ca59b68.png"
    },
    atlasKey: "atlascloud-van-2.6-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-van-2-6-image-to-video.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-5-image-to-video-fast",
    name: "Wan-2.5 Image-to-video Fast",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Get animated visuals from your images faster without major quality sacrifice. Perfect for preview workflows, previews at scale, or mass production of animated assets.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.071,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/71a7cce8-90cb-4982-8e46-a10efc59ef11.png"
    },
    atlasKey: "alibaba-wan-2.5-image-to-video-fast",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-5-image-to-video-fast.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-0-i2v-master",
    name: "kling v2.0 i2v Master",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Produces cinematic 1080p clips with refined lighting, camera realism, and cross-frame character stability.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.238,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/9cd8ef9d-d16c-4813-b72b-47c25bd727d1.png"
    },
    atlasKey: "kwaivgi-kling-v2.0-i2v-master",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-0-i2v-master.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-t2v-pro",
    name: "Hailuo-02 t2v Pro",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.49,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/455e3640-bba1-4a1e-ad6b-ae3a508f37fe.png"
    },
    atlasKey: "minimax-hailuo-02-t2v-pro",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-t2v-pro.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-1-t2v-master",
    name: "Kling v2.1 t2v Master",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Interprets complex text prompts with advanced motion logic and enhanced dynamic-camera rendering.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.238,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/7b456705-beb0-4664-aae9-40593f32ab6a.png"
    },
    atlasKey: "kwaivgi-kling-v2.1-t2v-master",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-1-t2v-master.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-fast",
    name: "Hailuo-02 Fast",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.1,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/659f4417-102d-4279-a8cd-ab67f4c0231f.png"
    },
    atlasKey: "minimax-hailuo-02-fast",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-fast.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-t2v-1080p",
    name: "Seedance v1 Lite t2v 1080p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "An efficient text-to-video model geared toward fast, cost-effective generation. Ideal for prototyping short narrative clips (5â€“10 s) with stylistic flexibility and prompt-faithful motion.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.081,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b6e4e990-53e7-4747-9a1b-cb540fe137b9.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-t2v-1080p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-t2v-1080p.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-pro",
    name: "Hailuo 02 Pro",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.49,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/656fb0d8-d9e0-48e7-9d56-d23242d9ab15.png"
    },
    atlasKey: "minimax-hailuo-02-pro",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-pro.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-1-i2v-master",
    name: "Kling v2.1 i2v Master",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Delivers professional-grade image-to-video generation with precise motion continuity and visual depth.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.238,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/3a95b14c-a235-44e3-b4e7-7189ff757e76.png"
    },
    atlasKey: "kwaivgi-kling-v2.1-i2v-master",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-1-i2v-master.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-t2v-720p",
    name: "Seedance v1 Lite t2v 720p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "An efficient text-to-video model geared toward fast, cost-effective generation. Ideal for prototyping short narrative clips (5â€“10 s) with stylistic flexibility and prompt-faithful motion.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.029,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/4c1f976f-3b29-4431-83ea-abf4313c64b2.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-t2v-720p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-t2v-720p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-i2v-1080p",
    name: "Seedance v1 Lite i2v 1080p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Animate static images into dynamic video with the Lite model. Delivers motion, transitions, and stylistic coherence at lower latency and cost, while preserving source imagery.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.081,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/7a8002fa-969f-4018-82e2-9b705b518c97.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-i2v-1080p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-i2v-1080p.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-2-spicy-video-extend-lora",
    name: "Wan-2.2-spicy Video Extend Lora",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.04,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/5037e233-8aec-45fc-b873-a82738a41604.png"
    },
    atlasKey: "alibaba-wan-2.2-spicy-video-extend-lora",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-spicy-video-extend-lora.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-2-spicy-video-extend",
    name: "Wan-2.2-spicy Video Extend",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["video"],
    tags: ["Video-Video"],
    description: "Open and Advanced Large-Scale Video Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/51aa32fa-ca66-4320-8e97-8fcb366d9c1a.png"
    },
    atlasKey: "alibaba-wan-2.2-spicy-video-extend",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-spicy-video-extend.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-t2v-standard",
    name: "Hailuo 02 t2v Standard",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.28,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/00bf6889-f254-4046-ad91-95d69472ab03.png"
    },
    atlasKey: "minimax-hailuo-02-t2v-standard",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-t2v-standard.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-i2v-standard",
    name: "Hailuo 02 i2v Standard",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.28,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/e2c32046-21aa-4708-894d-8edcb6d1c23e.png"
    },
    atlasKey: "minimax-hailuo-02-i2v-standard",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-i2v-standard.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-i2v-pro",
    name: "Hailuo 02 i2v Pro",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Hailuo 02 is a new AI video generation model from Hailuo AI.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.49,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c5dcbcd8-fc9d-4dd9-893f-8b9fb500ebfa.png"
    },
    atlasKey: "minimax-hailuo-02-i2v-pro",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-i2v-pro.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-1-i2v-pro",
    name: "Kling v2.1 i2v Pro",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Balances generation speed and fidelity, producing sharp, fluid image-to-video results for general creative use.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.083,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/e8fe8818-ed9c-4fdd-b349-4062a3f919a9.png"
    },
    atlasKey: "kwaivgi-kling-v2.1-i2v-pro",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-1-i2v-pro.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v1-6-t2v-standard",
    name: "Kling v1.6 t2v Standard",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "Entry-level text-to-video generator offering stable motion and prompt alignment for short-form outputs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/f8d7af68-587f-4880-8d33-0b70b623113e.png"
    },
    atlasKey: "kwaivgi-kling-v1.6-t2v-standard",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v1-6-t2v-standard.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v1-6-i2v-pro",
    name: "Kling v1.6 i2v Pro",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Upgraded image-to-video variant with smoother motion blending and improved texture realism.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.083,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/170a3c01-c5f1-4cdd-a170-14cbc553e2ca.png"
    },
    atlasKey: "kwaivgi-kling-v1.6-i2v-pro",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v1-6-i2v-pro.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-t2v-1080p",
    name: "Seedance v1 Pro t2v 1080p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "A full-fidelity text-to-video model built for cinematic results. Generates multi-shot, 1080p videos with smooth motion, strong prompt adherence, and scene continuity.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.11,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/fa39551d-37ac-438b-b615-e310ce39c96c.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-t2v-1080p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-t2v-1080p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-t2v-720p",
    name: "Seedance v1 Pro t2v 720p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "A full-fidelity text-to-video model built for cinematic results. Generates multi-shot, 1080p videos with smooth motion, strong prompt adherence, and scene continuity.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.047,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/fca05a49-e6a6-4e1b-aece-bf71b65e30d1.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-t2v-720p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-t2v-720p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-t2v-480p",
    name: "Seedance v1 Pro t2v 480p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "A full-fidelity text-to-video model built for cinematic results. Generates multi-shot, 1080p videos with smooth motion, strong prompt adherence, and scene continuity.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.022,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/ac622390-2cfb-4179-b842-c5731802b9a4.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-t2v-480p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-t2v-480p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-i2v-720p",
    name: "Seedance v1 Pro i2v 720p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Seedance Proâ€™s image-to-video mode transforms still visuals into cinematic motion, maintaining visual consistency and expressive animation across frames.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.047,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/599d78eb-f72c-4baa-a67e-f717e3bbf4c6.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-i2v-720p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-i2v-720p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-i2v-480p",
    name: "Seedance v1 Pro i2v 480p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Seedance Proâ€™s image-to-video mode transforms still visuals into cinematic motion, maintaining visual consistency and expressive animation across frames.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.022,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b6f134a5-6605-452a-b06d-1aefd1ff3d80.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-i2v-480p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-i2v-480p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-pro-i2v-1080p",
    name: "Seedance v1 Pro i2v 1080p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Seedance Proâ€™s image-to-video mode transforms still visuals into cinematic motion, maintaining visual consistency and expressive animation across frames.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.11,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/30e2830e-798d-4e47-b46d-efac4efa1e0f.png"
    },
    atlasKey: "bytedance-seedance-v1-pro-i2v-1080p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-pro-i2v-1080p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-t2v-480p",
    name: "Seedance v1 Lite t2v 480p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video"],
    description: "An efficient text-to-video model geared toward fast, cost-effective generation. Ideal for prototyping short narrative clips (5â€“10 s) with stylistic flexibility and prompt-faithful motion.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.014,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/54992807-f4da-40fe-b511-f38860a93471.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-t2v-480p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-t2v-480p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-i2v-720p",
    name: "Seedance v1 Lite i2v 720p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Animate static images into dynamic video with the Lite model. Delivers motion, transitions, and stylistic coherence at lower latency and cost, while preserving source imagery.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.029,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1b0bd117-4ee8-4a99-be0e-5991c2e386fc.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-i2v-720p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-i2v-720p.mp4"
    }
  },
  {
    slug: "bytedance-seedance-v1-lite-i2v-480p",
    name: "Seedance v1 Lite i2v 480p",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Animate static images into dynamic video with the Lite model. Delivers motion, transitions, and stylistic coherence at lower latency and cost, while preserving source imagery.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.014,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/71460cf5-9579-4376-918b-6eaf3b17e6bf.png"
    },
    atlasKey: "bytedance-seedance-v1-lite-i2v-480p",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/bytedance-seedance-v1-lite-i2v-480p.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v2-1-i2v-standard",
    name: "Kling v2.1 i2v Standard",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "A fast, reliable 720p model optimized for quick visual drafts and efficient prototyping.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/cf26fad7-66c3-49d0-9830-e9d24cd1a69e.png"
    },
    atlasKey: "kwaivgi-kling-v2.1-i2v-standard",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v2-1-i2v-standard.mp4"
    }
  },
  {
    slug: "kwaivgi-kling-v1-6-i2v-standard",
    name: "Kling v1.6 i2v Standard",
    vendor: "Kuaishou",
    vendorSlug: "kuaishou",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Lightweight early-generation model providing foundational image-to-video conversion at minimal cost.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.048,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/cc6ba347-2727-494f-89f6-c82faa17c4c2.png"
    },
    atlasKey: "kwaivgi-kling-v1.6-i2v-standard",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/kwaivgi-kling-v1-6-i2v-standard.mp4"
    }
  },
  {
    slug: "minimax-hailuo-02-standard",
    name: "Hailuo 02 Standard",
    vendor: "MiniMax",
    vendorSlug: "minimax",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "Hailuo 02 Standard - MiniMax's next-generation AI video model with 2.5x efficiency improvement, 85% complex instruction response rate, and industry-leading cost-effectiveness for generating high-quality videos.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.28,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bd19f20c-94cf-4ff8-8181-0fd42586a945.png"
    },
    atlasKey: "minimax-hailuo-02-standard",
    accent: "from-orange-500 to-amber-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/minimax-hailuo-02-standard.mp4"
    }
  },
  {
    slug: "xai-grok-imagine-image-quality-edit",
    name: "Grok Imagine Image Quality Edit",
    vendor: "xAI",
    vendorSlug: "xai",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "xAI Grok Imagine edits one or more reference images with natural-language instructions at 1K or 2K resolution. Supports single image and multi-image (<IMAGE_0>, <IMAGE_1>) reference editing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.055,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/xai-grok-imagine-image-quality-edit.jpg"
    },
    atlasKey: "xai-grok-imagine-image-quality-edit",
    accent: "from-fuchsia-500 to-pink-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/xai-grok-imagine-image-quality-edit.jpeg"
    }
  },
  {
    slug: "xai-grok-imagine-image-quality-text-to-image",
    name: "Grok Imagine Image Quality Text-to-Image",
    vendor: "xAI",
    vendorSlug: "xai",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "xAI Grok Imagine generates polished visuals from natural-language prompts at 1K or 2K resolution, with 14 aspect ratios.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.055,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/22a2647c-86d5-45c6-b2ca-fb427762e5da.png"
    },
    atlasKey: "xai-grok-imagine-image-quality-text-to-image",
    accent: "from-fuchsia-500 to-pink-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/xai-grok-imagine-image-quality-text-to-image.jpeg"
    }
  },
  {
    slug: "alibaba-wan-2-5-image-edit",
    name: "Wan-2.5 Image Edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Open and Advanced Large-Scale Image Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/6fb58b4b-047f-4369-b245-654f52695fb1.png"
    },
    atlasKey: "alibaba-wan-2.5-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-5-image-edit.png"
    }
  },
  {
    slug: "alibaba-wan-2-5-text-to-image",
    name: "Wan-2.5 Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Generate AI images with Alibaba WAN 2.5 text-to-image model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/ce1d4b52-47c8-4e92-b15f-8080ce5ccd2a.png"
    },
    atlasKey: "alibaba-wan-2.5-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-5-text-to-image.png"
    }
  },
  {
    slug: "bytedance-seedream-v4",
    name: "Seedream v4",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Open and Advanced Large-Scale Image Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.027,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/88d9f1c6-46b7-453f-a4f6-9a5131a57d39.png"
    },
    atlasKey: "bytedance-seedream-v4",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4.jpeg"
    }
  },
  {
    slug: "bytedance-seedream-v4-sequential",
    name: "Seedream v4 Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Open and Advanced Large-Scale Image Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.027,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/d491920a-96f4-4f9c-a1c7-5bf7bd7d1e6e.png"
    },
    atlasKey: "bytedance-seedream-v4-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-sequential.jpeg"
    }
  },
  {
    slug: "atlascloud-van-2-5-image-to-video",
    name: "Van-2.5 Image-to-video",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video","HOT"],
    description: "Get animated visuals from your images faster without major quality sacrifice. Perfect for preview workflows, previews at scale, or mass production of animated assets.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.054,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/b4ee8f46-f107-408a-be15-0d8da5279444.png"
    },
    atlasKey: "atlascloud-van-2.5-image-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-van-2-5-image-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedream-v4-edit",
    name: "Seedream v4 Edit",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Open and Advanced Large-Scale Image Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.027,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/edd71253-a26b-416d-b662-5dc1a422d502.png"
    },
    atlasKey: "bytedance-seedream-v4-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-edit.jpeg"
    }
  },
  {
    slug: "alibaba-qwen-image-edit",
    name: "Qwen-Image Edit",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Supports multiple image inputs and outputs, allowing for precise modification of text within images, addition, deletion, or movement of objects, alteration of subject actions, transfer of image styles, and enhancement of image details.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.032,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/af6fc043-ed82-463b-9239-2c9573ba850b.png"
    },
    atlasKey: "alibaba-qwen-image-edit",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-qwen-image-edit.webp"
    }
  },
  {
    slug: "alibaba-qwen-image-edit-plus",
    name: "Qwen-Image Edit Plus",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Supports multiple image inputs and outputs, allowing for precise modification of text within images, addition, deletion, or movement of objects, alteration of subject actions, transfer of image styles, and enhancement of image details.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/23394488-656b-48d2-8701-f99f42203615.png"
    },
    atlasKey: "alibaba-qwen-image-edit-plus",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-qwen-image-edit-plus.webp"
    }
  },
  {
    slug: "alibaba-wan-2-2-animate-mix",
    name: "Wan-2.2 Video Character Swap",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "The Wan video character swap model replaces the main character in a video with a character from an image. This model preserves the scene, lighting, and tone of the original video to ensure a seamless result.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.126,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/8f0ec84c-3967-4024-8d3c-a0ade7bf0aed.png"
    },
    atlasKey: "alibaba-wan-2.2-animate-mix",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-animate-mix.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-2-animate-move",
    name: "Wan-2.2 Image To Animation",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "video",
    modalities: ["image","video"],
    tags: ["Hình ảnh-Video"],
    description: "The Wan image-to-animation model generates a video of a moving person based on a character image and a reference video.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.084,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn","Khởi từ ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/2ccf0855-01b4-4338-9494-87667de18ba8.png"
    },
    atlasKey: "alibaba-wan-2.2-animate-move",
    accent: "from-rose-500 to-red-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/alibaba-wan-2-2-animate-move.mp4"
    }
  },
  {
    slug: "alibaba-wan-2-6-text-to-image",
    name: "Wan-2.6 Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Generates images based on text, supports various artistic styles and realistic photographic effects, and meets diverse creative needs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.021,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/03a465ab-18d6-4257-a8c1-7e76b3d66a68.png"
    },
    atlasKey: "alibaba-wan-2.6-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/alibaba-wan-2-6-text-to-image.png"
    }
  },
  {
    slug: "atlascloud-van-2-5-text-to-video",
    name: "Van-2.5 Text-to-video",
    vendor: "Other",
    vendorSlug: "other",
    category: "video",
    modalities: ["text","video"],
    tags: ["Văn bản-Video","HOT"],
    description: "Convert prompts into cinematic video clips with synchronized sound. Van 2.5 generates 720p/1080p outputs with stable motion, native audio sync, and prompt-faithful visual storytelling.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.068,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/0b31d7a9-f13f-4e0a-a029-b724535d70f4.png"
    },
    atlasKey: "atlascloud-van-2.5-text-to-video",
    accent: "from-red-500 to-rose-600",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/atlascloud-van-2-5-text-to-video.mp4"
    }
  },
  {
    slug: "bytedance-seedream-v4-edit-sequential",
    name: "Seedream v4 Edit Sequential",
    vendor: "ByteDance",
    vendorSlug: "bytedance",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Open and Advanced Large-Scale Image Generative Models.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.027,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/06fc9a93-fd87-465c-a199-e5158193f240.png"
    },
    atlasKey: "bytedance-seedream-v4-edit-sequential",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/bytedance-seedream-v4-edit-sequential.jpeg"
    }
  },
  {
    slug: "google-nano-banana-text-to-image",
    name: "Nano Banana Text-to-image",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's state-of-the-art image generation and editing model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.038,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/1c42bb92-1ba5-4531-aaaf-dc8e43a93210.png"
    },
    atlasKey: "google-nano-banana-text-to-image",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-text-to-image.png"
    }
  },
  {
    slug: "google-nano-banana-edit",
    name: "Nano Banana Edit",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "Google's state-of-the-art image generation and editing model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.038,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c847b6b0-ad5f-4a46-a6ae-e0b503afe125.png"
    },
    atlasKey: "google-nano-banana-edit",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-nano-banana-edit.png"
    }
  },
  {
    slug: "google-imagen3",
    name: "Imagen3",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's highest quality text-to-image model, capable of generating images with detail, rich lighting and beauty.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.04,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/28748ce8-541a-4e26-bc15-a908fee235b2.png"
    },
    atlasKey: "google-imagen3",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-imagen3.png"
    }
  },
  {
    slug: "google-imagen3-fast",
    name: "Image3 Fast",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's highest quality text-to-image model, capable of generating images with detail, rich lighting and beauty.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a79f5b4e-0340-4a96-96a6-10af063e6564.png"
    },
    atlasKey: "google-imagen3-fast",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-imagen3-fast.png"
    }
  },
  {
    slug: "atlascloud-qwen-image-text-to-image",
    name: "Qwen Image Text-to-image",
    vendor: "Qwen",
    vendorSlug: "qwen",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh","HOT"],
    description: "Qwen-Image , a 20B MMDiT model for next-gen text-to-image generation.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.024,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/eeaa8c58-27da-479d-aa73-8b83cab34fd6.png"
    },
    atlasKey: "atlascloud-qwen-image-text-to-image",
    accent: "from-purple-500 to-violet-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/atlascloud-qwen-image-text-to-image.jpeg"
    }
  },
  {
    slug: "google-imagen4-fast",
    name: "Imagen4 Fast",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's Imagen 4 flagship model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.02,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c43f05eb-395f-4754-baa6-9b7f9ab2d4e9.png"
    },
    atlasKey: "google-imagen4-fast",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-imagen4-fast.png"
    }
  },
  {
    slug: "black-forest-labs-flux-dev",
    name: "Flux Dev",
    vendor: "Black Forest Labs",
    vendorSlug: "black-forest-labs",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Flux-dev text to image model, 12 billion parameter rectified flow transformer.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.012,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/a51a3d85-54e6-4080-8807-25998df27171.png"
    },
    atlasKey: "black-forest-labs-flux-dev",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/black-forest-labs-flux-dev.jpeg"
    }
  },
  {
    slug: "black-forest-labs-flux-kontext-dev",
    name: "Flux Kontext Dev",
    vendor: "Black Forest Labs",
    vendorSlug: "black-forest-labs",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh"],
    description: "FLUX.1 Kontext [dev] is a development version of the state-of-the-art image editing model that lets you edit images using text prompts. It makes editing intuitive by understanding the relationship between visuals and language.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.025,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/17293e6d-bdc8-48a9-9051-de84ecb500c4.png"
    },
    atlasKey: "black-forest-labs-flux-kontext-dev",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/black-forest-labs-flux-kontext-dev.jpeg"
    }
  },
  {
    slug: "google-imagen4-ultra",
    name: "Imagen4 Ultra",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Googleâ€™s highest quality image generation model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.06,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/bc1da4b9-75be-45f3-a902-8c58031868a9.png"
    },
    atlasKey: "google-imagen4-ultra",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-imagen4-ultra.png"
    }
  },
  {
    slug: "google-imagen4",
    name: "Imagen4",
    vendor: "Google",
    vendorSlug: "google",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Google's Imagen 4 flagship model.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.04,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/70acdfc8-6eb7-4ed7-9ee6-3a53daa58396.png"
    },
    atlasKey: "google-imagen4",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/google-imagen4.png"
    }
  },
  {
    slug: "black-forest-labs-flux-kontext-dev-lora",
    name: "Flux Kontext Dev Lora",
    vendor: "Black Forest Labs",
    vendorSlug: "black-forest-labs",
    category: "image",
    modalities: ["image"],
    tags: ["Hình ảnh-Hình ảnh","HOT"],
    description: "Fast FLUX.1 Kontext [dev] endpoint with LoRA support for rapid image editing using pre-trained adapters for brand and style. Ready-to-use REST inference API, best performance, no coldstarts, affordable pricing.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.03,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: false,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c2c82d07-eb51-44c4-b8eb-1c2a223040de.png"
    },
    atlasKey: "black-forest-labs-flux-kontext-dev-lora",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/black-forest-labs-flux-kontext-dev-lora.jpeg"
    }
  },
  {
    slug: "black-forest-labs-flux-schnell",
    name: "Flux Schnell",
    vendor: "Black Forest Labs",
    vendorSlug: "black-forest-labs",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "FLUX.1 [schnell] is fastest image generation model tailored for local development and personal use, a 12 billion parameter rectified flow transformer.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.003,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/68631129-1c7b-4be6-b3d4-2551cecd9470.png"
    },
    atlasKey: "black-forest-labs-flux-schnell",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/black-forest-labs-flux-schnell.jpeg"
    }
  },
  {
    slug: "veed-fabric-1-0-image-to-video",
    name: "Veed-fabric-1.0 Image-to-Video",
    vendor: "Independent",
    vendorSlug: "independent",
    category: "video",
    modalities: ["video","audio"],
    tags: ["Âm thanh-Video"],
    description: "Veed-fabric-1.0 Image-to-Video — mô hình Âm thanh-Video của Independent. Loại: Video. Phù hợp cho sáng tạo nội dung, prototype nhanh và tích hợp API.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.088,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/veed-fabric-1.0-image-to-video.jpg"
    },
    atlasKey: "veed-fabric-1.0-image-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/veed-fabric-1-0-image-to-video.mp4"
    }
  },
  {
    slug: "veed-fabric-1-0-fast-image-to-video",
    name: "Veed-fabric-1.0-fast Image-to-Video",
    vendor: "Independent",
    vendorSlug: "independent",
    category: "video",
    modalities: ["video","audio"],
    tags: ["Âm thanh-Video"],
    description: "Veed-fabric-1.0-fast Image-to-Video — mô hình Âm thanh-Video của Independent. Loại: Video. Phù hợp cho sáng tạo nội dung, prototype nhanh và tích hợp API.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.11,
        unit: "second"
      }
    },
    capabilities: ["Sinh video","Đa tỉ lệ","Độ phân giải tuỳ chọn"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/ff04bb97-6701-47c0-b083-2d52f48f6b65.png"
    },
    atlasKey: "veed-fabric-1.0-fast-image-to-video",
    accent: "from-pink-500 to-rose-500",
    sampleMedia: {
      type: "video",
      src: "/models-media/samples/veed-fabric-1-0-fast-image-to-video.mp4"
    }
  },
  {
    slug: "black-forest-labs-flux-dev-lora",
    name: "Flux Dev Lora",
    vendor: "Black Forest Labs",
    vendorSlug: "black-forest-labs",
    category: "image",
    modalities: ["text","image"],
    tags: ["Văn bản-Hình ảnh"],
    description: "Rapid, high-quality image generation with FLUX.1 [dev] and LoRA support for personalized styles and brand-specific outputs.",
    releaseDate: "2026-01-01",
    pricing: {
      perRun: {
        amount: 0.015,
        unit: "image"
      }
    },
    capabilities: ["Sinh ảnh","Prompt tự nhiên","Đa phong cách","Chỉnh sửa ảnh"],
    isNew: true,
    isFeatured: false,
    demoMedia: {
      type: "image",
      src: "/models-media/covers/c503a71d-fe5b-4fb3-a6dd-2e8b917ba072.png"
    },
    atlasKey: "black-forest-labs-flux-dev-lora",
    accent: "from-indigo-500 to-blue-500",
    sampleMedia: {
      type: "image",
      src: "/models-media/samples/black-forest-labs-flux-dev-lora.jpeg"
    }
  }
];
export const ATLAS_UUID_TO_SLUG: Record<string, string> = {};
