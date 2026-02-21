import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { PdfFile } from '../../core/models/pdf-file.model';
import { PageItem, createPageItem } from '../../core/models/page-item.model';
import { PdfLibService } from '../../core/services/pdf-lib.service';
import { PdfRenderService } from '../../core/services/pdf-render.service';
import { TauriFsService } from '../../core/services/tauri-fs.service';

export interface OrganizerState {
  file: PdfFile | null;
  pages: PageItem[];
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

const initialState: OrganizerState = {
  file: null,
  pages: [],
  isProcessing: false,
  progress: 0,
  error: null,
};

export const OrganizerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedCount: () => store.pages().filter(p => p.selected).length,
    selectedPages: () => store.pages().filter(p => p.selected),
  })),
  withMethods((store) => {
    const pdfService = inject(PdfLibService);
    const renderService = inject(PdfRenderService);
    const fsService = inject(TauriFsService);

    return {
      setFile: async (file: File, width = 150) => {
        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          const pageCount = await pdfService.getPageCount(file);
          const pdfFile: PdfFile = {
            id: crypto.randomUUID(),
            name: file.name.replace('.pdf', ''),
            size: file.size,
            pageCount,
            file,
            loaded: true,
          };

          const pages = Array.from({ length: pageCount }, (_, i) => createPageItem(i));
          patchState(store, { file: pdfFile, pages, isProcessing: false });

          renderService.renderAllPages(file, width, 'jpeg', 0.8, (current, total) => {
            patchState(store, { progress: Math.round((current / total) * 100) });
          }).then((thumbnails) => {
            const updatedPages = store.pages().map(p => ({
              ...p,
              thumbnailUrl: thumbnails.get(p.pageNumber) || null,
              loading: false,
            }));
            patchState(store, { pages: updatedPages });
          });
        } catch (error: any) {
          patchState(store, {
            isProcessing: false,
            error: error.message || 'Failed to load PDF'
          });
        }
      },

      rerenderThumbnails: async (width: number) => {
        const file = store.file();
        if (!file) return;

        const currentPages = store.pages();

        const oldUrls = currentPages
          .map(p => p.thumbnailUrl)
          .filter((u): u is string => u !== null);
        renderService.revokeUrls(oldUrls);

        const pages = currentPages.map(p => ({
          ...p,
          thumbnailUrl: null,
          loading: true,
        }));
        patchState(store, { pages });

        const thumbnails = await renderService.renderAllPages(file.file, width);

        const updatedPages = currentPages.map(p => ({
          ...p,
          thumbnailUrl: thumbnails.get(p.pageNumber) || null,
          loading: false,
        }));
        patchState(store, { pages: updatedPages });
      },

      clearFile: () => {
        const urls = store.pages()
          .map(p => p.thumbnailUrl)
          .filter((u): u is string => u !== null);
        renderService.revokeUrls(urls);
        patchState(store, { file: null, pages: [] });
      },

      togglePageSelection: (pageId: string) => {
        const pages = store.pages().map(p =>
          p.id === pageId ? { ...p, selected: !p.selected } : p
        );
        patchState(store, { pages });
      },

      selectAll: () => {
        const pages = store.pages().map(p => ({ ...p, selected: true }));
        patchState(store, { pages });
      },

      deselectAll: () => {
        const pages = store.pages().map(p => ({ ...p, selected: false }));
        patchState(store, { pages });
      },

      deleteSelected: () => {
        const pages = store.pages().filter(p => !p.selected);
        const deletedUrls = store.pages()
          .filter(p => p.selected)
          .map(p => p.thumbnailUrl)
          .filter((u): u is string => u !== null);

        renderService.revokeUrls(deletedUrls);

        const reorderedPages = pages.map((p, i) => ({
          ...p,
          pageNumber: i + 1,
        }));

        patchState(store, { pages: reorderedPages });
      },

      rotateSelected: (degrees: 90 | -90) => {
        const pages = store.pages().map(p => {
          if (p.selected) {
            let newRotation = (p.rotation + degrees) % 360;
            if (newRotation < 0) newRotation += 360;
            return { ...p, rotation: newRotation as 0 | 90 | 180 | 270 };
          }
          return p;
        });
        patchState(store, { pages });
      },

      reorderPages: (pages: PageItem[]) => {
        const reorderedPages = pages.map((p, i) => ({
          ...p,
          pageNumber: i + 1,
        }));
        patchState(store, { pages: reorderedPages });
      },

      save: async () => {
        const file = store.file();
        if (!file) return;

        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          const pageOrder = store.pages().map(p => p.originalIndex);
          const rotations = new Map<number, number>();
          store.pages().forEach(p => {
            if (p.rotation !== 0) {
              rotations.set(p.originalIndex, p.rotation);
            }
          });

          const data = await pdfService.organizePdf(file.file, pageOrder, rotations);

          const savePath = await fsService.saveFilePicker({
            title: 'Save Organized PDF',
            defaultPath: `${file.name}_organized.pdf`,
          });

          if (savePath) {
            await fsService.writeFile(savePath, data);
          } else {
            fsService.downloadFile(data, `${file.name}_organized.pdf`);
          }

          patchState(store, { isProcessing: false, progress: 100 });
        } catch (error: any) {
          patchState(store, {
            isProcessing: false,
            error: error.message || 'Failed to save PDF'
          });
        }
      },

      cancel: () => {
        renderService.cancelAll();
        patchState(store, { isProcessing: false, progress: 0 });
      },

      clearError: () => {
        patchState(store, { error: null });
      },
    };
  })
);
