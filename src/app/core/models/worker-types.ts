export interface PageRange {
  start: number;
  end: number;
}

export interface SplitResult {
  filename: string;
  pages: PageRange;
  data: Uint8Array;
}

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontSize: number;
}

export interface EditAction {
  id: string;
  originalTextItem: TextItem;
  newText: string;
}
