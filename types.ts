
import { type ASPECT_RATIOS } from './constants';

export type AspectRatio = typeof ASPECT_RATIOS[number]['value'];

export interface GenerationRequest {
  id: string;
  prompt: string;
  quantity: number;
  labels: string[];
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  labels: string[];
  base64: string;
  parentId?: string;
}
