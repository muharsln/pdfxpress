export interface PageItem {
  id: string;
  pageNumber: number;
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
  thumbnailUrl: string | null;
  selected: boolean;
  loading: boolean;
}

export function createPageItem(index: number): PageItem {
  return {
    id: crypto.randomUUID(),
    pageNumber: index + 1,
    originalIndex: index,
    rotation: 0,
    thumbnailUrl: null,
    selected: false,
    loading: true,
  };
}
