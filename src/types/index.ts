export interface Wallpaper {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'webp';
  createdAt: string;
  downloads: number;
  tags: string[];
  optimizedFor360: boolean;
}

export interface GenerateImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface ImageProcessOptions {
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
  optimize360?: boolean;
}
