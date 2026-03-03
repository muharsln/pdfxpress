import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { PdfFile } from '../../core/models/pdf-file.model';
import { TextItem, EditAction } from '../../core/models/worker-types';
import { PdfRenderService } from '../../core/services/pdf-render.service';
import { PdfLibService } from '../../core/services/pdf-lib.service';
import { FileSystemService } from '../../core/services/file-system.service';

export interface EditorState {
  file: PdfFile | null;
  currentPage: number;
  totalPages: number;
  viewportWidth: number;
  renderUrl: string | null;
  textItems: TextItem[];
  edits: EditAction[];
  isProcessing: boolean;
  error: string | null;
}

const initialState: EditorState = {
  file: null,
  currentPage: 1,
  totalPages: 0,
  viewportWidth: 1000,
  renderUrl: null,
  textItems: [],
  edits: [],
  isProcessing: false,
  error: null,
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasEdits: computed(() => store.edits().length > 0),
    pageEdits: computed(() => store.edits()),
  })),
  withMethods((store) => {
    const renderService = inject(PdfRenderService);
    const pdfService = inject(PdfLibService);
    const fsService = inject(FileSystemService);

    const loadPageData = async () => {
      const file = store.file();
      if (!file) return;

      patchState(store, { isProcessing: true, error: null });

      try {
        const url = await renderService.renderPage(
          file.file,
          store.currentPage(),
          store.viewportWidth(),
        );

        // Cleanup old url
        const oldUrl = store.renderUrl();
        if (oldUrl) renderService.revokeUrls([oldUrl]);

        const items = await renderService.extractTextContent(
          file.file,
          store.currentPage(),
          store.viewportWidth(),
        );

        patchState(store, {
          renderUrl: url,
          textItems: items,
          isProcessing: false,
        });
      } catch (error: unknown) {
        console.error('Render error:', error);
        patchState(store, { isProcessing: false, error: 'Failed to render page for editing' });
      }
    };

    return {
      setFile: async (rawFile: File) => {
        patchState(store, { isProcessing: true });
        try {
          const pageCount = await pdfService.getPageCount(rawFile);
          patchState(store, {
            file: {
              id: crypto.randomUUID(),
              name: rawFile.name,
              size: rawFile.size,
              pageCount,
              file: rawFile,
              loaded: true,
            },
            totalPages: pageCount,
            currentPage: 1,
            edits: [], // Reset edits when a new file is loaded
            isProcessing: false,
          });
          await loadPageData();
        } catch (error: unknown) {
          console.error('PDF load error:', error);
          patchState(store, { error: 'Invalid PDF document', isProcessing: false });
        }
      },

      clearFile: () => {
        const url = store.renderUrl();
        if (url) renderService.revokeUrls([url]);
        patchState(store, initialState);
      },

      nextPage: async () => {
        if (store.currentPage() < store.totalPages()) {
          patchState(store, { currentPage: store.currentPage() + 1 });
          await loadPageData();
        }
      },

      prevPage: async () => {
        if (store.currentPage() > 1) {
          patchState(store, { currentPage: store.currentPage() - 1 });
          await loadPageData();
        }
      },

      addEdit: (item: TextItem, newText: string) => {
        // If the text is unchanged, or same as original, don't add
        if (newText === item.text) return;

        const currentEdits = store.edits();
        const existingIdx = currentEdits.findIndex((e) => e.originalTextItem.id === item.id);

        const newEdits = [...currentEdits];
        if (existingIdx >= 0) {
          // Update existing
          newEdits[existingIdx] = { ...newEdits[existingIdx], newText };
        } else {
          // Add new
          newEdits.push({ id: crypto.randomUUID(), originalTextItem: item, newText });
        }

        patchState(store, { edits: newEdits });
      },

      discardEdit: (itemId: string) => {
        patchState(store, { edits: store.edits().filter((e) => e.originalTextItem.id !== itemId) });
      },

      save: async () => {
        const file = store.file();
        if (!file || store.edits().length === 0) return;

        patchState(store, { isProcessing: true, error: null });

        try {
          const editedPdf = await pdfService.editTextInPdf(file.file, [
            {
              pageNumber: store.currentPage(),
              viewportWidth: store.viewportWidth(),
              actions: store.edits(),
            },
          ]);

          fsService.downloadFile(editedPdf, file.name.replace('.pdf', '_edited.pdf'));
          patchState(store, { isProcessing: false });
        } catch (error: unknown) {
          console.error('Save error:', error);
          patchState(store, { error: 'Failed to write edits to PDF', isProcessing: false });
        }
      },

      clearError: () => patchState(store, { error: null }),
    };
  }),
);
