import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { PdfFile } from '../../core/models/pdf-file.model';
import { PdfLibService } from '../../core/services/pdf-lib.service';
import { TauriFsService } from '../../core/services/tauri-fs.service';

export interface MergerState {
  files: PdfFile[];
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

const initialState: MergerState = {
  files: [],
  isProcessing: false,
  progress: 0,
  error: null,
};

export const MergerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalPages: computed(() => store.files().reduce((sum, f) => sum + f.pageCount, 0)),
    totalSize: computed(() => store.files().reduce((sum, f) => sum + f.size, 0)),
    fileCount: computed(() => store.files().length),
  })),
  withMethods((store) => {
    const pdfService = inject(PdfLibService);
    const fsService = inject(TauriFsService);
    
    return {
      addFiles: async (newFiles: File[]) => {
        for (const file of newFiles) {
          const pageCount = await pdfService.getPageCount(file);
          const pdfFile: PdfFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            pageCount,
            file,
            loaded: true,
          };
          patchState(store, { files: [...store.files(), pdfFile] });
        }
      },
      
      removeFile: (id: string) => {
        patchState(store, { 
          files: store.files().filter(f => f.id !== id) 
        });
      },
      
      reorderFiles: (files: PdfFile[]) => {
        patchState(store, { files });
      },
      
      clearFiles: () => {
        patchState(store, { files: [], error: null });
      },
      
      merge: async () => {
        if (store.files().length < 2) {
          patchState(store, { error: 'Please add at least 2 PDF files to merge' });
          return;
        }
        
        patchState(store, { isProcessing: true, progress: 0, error: null });
        
        try {
          const files = store.files().map(f => f.file);
          const merged = await pdfService.mergePdfs(files, (progress) => {
            patchState(store, { progress });
          });
          
          const savePath = await fsService.saveFilePicker({
            title: 'Save Merged PDF',
            defaultPath: 'merged.pdf',
          });
          
          if (savePath) {
            await fsService.writeFile(savePath, merged);
          } else {
            fsService.downloadFile(merged, 'merged.pdf');
          }
          
          patchState(store, { isProcessing: false, progress: 100 });
        } catch (error: any) {
          patchState(store, { 
            isProcessing: false, 
            error: error.message || 'Failed to merge PDFs' 
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
