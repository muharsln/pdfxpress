export interface PageRange {
  start: number;
  end: number;
}

export interface SplitResult {
  filename: string;
  pages: PageRange;
  data: Uint8Array;
}
