export interface PdfFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  file: File;
  loaded: boolean;
  error?: string;
}

export interface PageRange {
  start: number;
  end: number;
}

export interface SplitResult {
  filename: string;
  pages: PageRange;
  data: Uint8Array;
}

export interface PageItem {
  id: string;
  pageNumber: number;
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
  thumbnailUrl?: string;
  selected: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface OpenDialogOptions {
  title?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  multiple?: boolean;
}
