import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { PdfFile } from '../../core/models/pdf-file.model';
import { PageRange } from '../../core/models/worker-types';
import { PdfLibService } from '../../core/services/pdf-lib.service';
import { FileSystemService } from '../../core/services/file-system.service';

export type SplitMode = 'range' | 'burst' | 'fixed';

export interface SplitterState {
  file: PdfFile | null;
  mode: SplitMode;
  rangeInput: string;
  fixedSize: number;
  filenamePrefix: string;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

const initialState: SplitterState = {
  file: null,
  mode: 'range',
  rangeInput: '1',
  fixedSize: 1,
  filenamePrefix: 'split',
  isProcessing: false,
  progress: 0,
  error: null,
};

export const SplitterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const pdfService = inject(PdfLibService);
    const fsService = inject(FileSystemService);

    return {
      setFile: async (file: File) => {
        const pageCount = await pdfService.getPageCount(file);
        const pdfFile: PdfFile = {
          id: crypto.randomUUID(),
          name: file.name.replace('.pdf', ''),
          size: file.size,
          pageCount,
          file,
          loaded: true,
        };
        patchState(store, { file: pdfFile, filenamePrefix: pdfFile.name });
      },

      setMode: (mode: SplitMode) => {
        patchState(store, { mode });
      },

      setRangeInput: (input: string) => {
        patchState(store, { rangeInput: input });
      },

      setFixedSize: (size: number) => {
        patchState(store, { fixedSize: size });
      },

      setFilenamePrefix: (prefix: string) => {
        patchState(store, { filenamePrefix: prefix });
      },

      clearFile: () => {
        patchState(store, { file: null, rangeInput: '1' });
      },

      split: async () => {
        const file = store.file();
        if (!file) return;

        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          let ranges: PageRange[];

          if (store.mode() === 'burst') {
            ranges = Array.from({ length: file.pageCount }, (_, i) => ({
              start: i + 1,
              end: i + 1,
            }));
          } else if (store.mode() === 'fixed') {
            ranges = [];
            const size = store.fixedSize();
            for (let i = 1; i <= file.pageCount; i += size) {
              ranges.push({
                start: i,
                end: Math.min(i + size - 1, file.pageCount),
              });
            }
          } else {
            ranges = parseRangeString(store.rangeInput(), file.pageCount);
          }

          if (ranges.length === 0) {
            throw new Error('No valid page ranges specified');
          }

          const results = await pdfService.splitPdf(
            file.file,
            ranges,
            store.filenamePrefix()
          );

          results.forEach((r, i) => {
            fsService.downloadFile(r.data, r.filename);
            patchState(store, { progress: Math.round(((i + 1) / results.length) * 100) });
          });

          patchState(store, { isProcessing: false, progress: 100 });
        } catch (error: any) {
          patchState(store, {
            isProcessing: false,
            error: error.message || 'Failed to split PDF'
          });
        }
      },

      cancel: () => {
        patchState(store, { isProcessing: false, progress: 0 });
      },

      clearError: () => {
        patchState(store, { error: null });
      },
    };
  })
);

function parseRangeString(input: string, maxPages: number): PageRange[] {
  const ranges: PageRange[] = [];
  const parts = input.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = endStr.toLowerCase() === 'end' ? maxPages : parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
        ranges.push({ start, end });
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page > 0 && page <= maxPages) {
        ranges.push({ start: page, end: page });
      }
    }
  }

  return ranges.sort((a, b) => a.start - b.start);
}
