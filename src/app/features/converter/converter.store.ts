import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { PdfLibService } from '../../core/services/pdf-lib.service';
import { PdfRenderService } from '../../core/services/pdf-render.service';
import { TauriFsService } from '../../core/services/tauri-fs.service';
import { PageRange } from '../../core/models/worker-types';

export type ConverterMode = 'pdf-to-image' | 'image-to-pdf';
export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface ConverterState {
  mode: ConverterMode;
  pdfFile: File | null;
  imageFiles: File[];
  pdfPageCount: number;
  pdfRangeInput: string;
  imageFormat: ImageFormat;
  imageQuality: number;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

const initialState: ConverterState = {
  mode: 'pdf-to-image',
  pdfFile: null,
  imageFiles: [],
  pdfPageCount: 0,
  pdfRangeInput: '1',
  imageFormat: 'png',
  imageQuality: 90,
  isProcessing: false,
  progress: 0,
  error: null,
};

export const ConverterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const pdfService = inject(PdfLibService);
    const renderService = inject(PdfRenderService);
    const fsService = inject(TauriFsService);

    return {
      setMode: (mode: ConverterMode) => {
        patchState(store, { mode, error: null });
      },

      setPdfFile: async (file: File) => {
        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          const pageCount = await pdfService.getPageCount(file);
          patchState(store, {
            pdfFile: file,
            pdfPageCount: pageCount,
            pdfRangeInput: pageCount > 1 ? `1-${pageCount}` : '1',
            isProcessing: false
          });
        } catch (error: any) {
          patchState(store, {
            isProcessing: false,
            error: error.message || 'PDF yüklenemedi'
          });
        }
      },

      setImageFiles: (files: File[]) => {
        patchState(store, { imageFiles: files, error: null });
      },

      setPdfRangeInput: (input: string) => {
        patchState(store, { pdfRangeInput: input });
      },

      setImageFormat: (format: ImageFormat) => {
        patchState(store, { imageFormat: format });
      },

      setImageQuality: (quality: number) => {
        patchState(store, { imageQuality: quality });
      },

      clearPdf: () => {
        patchState(store, { pdfFile: null, pdfPageCount: 0, pdfRangeInput: '1' });
      },

      clearImages: () => {
        patchState(store, { imageFiles: [] });
      },

      convertPdfToImages: async () => {
        const file = store.pdfFile();
        if (!file) return;

        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          const ranges = parseRangeString(store.pdfRangeInput(), store.pdfPageCount());
          const pagesToRender: number[] = [];

          for (const range of ranges) {
            for (let i = range.start; i <= range.end; i++) {
              pagesToRender.push(i);
            }
          }

          const format = store.imageFormat();
          const quality = store.imageQuality();
          const total = pagesToRender.length;

          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();

          for (let i = 0; i < total; i++) {
            const pageNum = pagesToRender[i];
            const dataUrl = await renderService.renderPage(file, pageNum, 1200, format, quality / 100);

            // Extract base64 data to add to zip
            const base64Data = dataUrl.split(',')[1];
            zip.file(`page_${pageNum}.${format}`, base64Data, { base64: true });

            patchState(store, { progress: Math.round(((i + 1) / total) * 90) }); // Allocate 90% for rendering
          }

          // Generate the zip and download using fsService
          const zipBytes = await zip.generateAsync({
            type: 'uint8array',
            compression: 'STORE' // No need to compress JPEGs/PNGs further, saves time
          }, (metadata) => {
            patchState(store, { progress: 90 + Math.round(metadata.percent * 0.1) });
          });

          fsService.downloadFile(
            zipBytes,
            `${file.name.replace('.pdf', '')}_images.zip`,
            'application/zip'
          );

          patchState(store, { isProcessing: false, progress: 100 });
        } catch (error: any) {
          patchState(store, {
            isProcessing: false,
            error: error.message || 'Dönüştürme başarısız'
          });
        }
      },

      convertImagesToPdf: async () => {
        const files = store.imageFiles();
        if (files.length === 0) return;

        patchState(store, { isProcessing: true, progress: 0, error: null });

        try {
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.create();

          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Normalize image to JPEG using Canvas to ensure pdf-lib compatibility (WebP, BMP, etc.)
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d')!;

            // Fill white background for transparent images
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Get standard JPEG buffer
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const base64Data = dataUrl.split(',')[1];
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let j = 0; j < len; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }

            const image = await pdfDoc.embedJpg(bytes);

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });

            URL.revokeObjectURL(img.src);
            patchState(store, { progress: Math.round(((i + 1) / files.length) * 100) });
          }

          const pdfBytes = await pdfDoc.save();
          fsService.downloadFile(new Uint8Array(pdfBytes), 'converted.pdf');

          patchState(store, { isProcessing: false, progress: 100 });
        } catch (error: any) {
          console.error("Image to PDF conversion failed:", error);
          patchState(store, {
            isProcessing: false,
            error: error.message || 'PDF oluşturulamadı'
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
      const end = endStr.toLowerCase() === 'son' || endStr.toLowerCase() === 'end' ? maxPages : parseInt(endStr, 10);

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
