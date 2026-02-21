import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface IPdfRenderService {
  renderPage(file: File, pageNumber: number, width: number): Promise<string>;
  renderAllPages(file: File, width: number, onProgress?: (current: number, total: number) => void): Promise<Map<number, string>>;
  cancelAll(): void;
  revokeUrls(urls: string[]): void;
}

@Injectable({ providedIn: 'root' })
export class PdfRenderService implements IPdfRenderService {
  private activeOperations: Map<number, AbortController> = new Map();

  async renderPage(file: File, pageNumber: number, width: number): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);
    
    const scale = width / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d')!;
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  async renderAllPages(
    file: File, 
    width: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<Map<number, string>> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const results = new Map<number, string>();
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const scale = width / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d')!;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      
      results.set(i, canvas.toDataURL('image/jpeg', 0.8));
      onProgress?.(i, totalPages);
    }
    
    return results;
  }

  cancelAll(): void {
    this.activeOperations.forEach((controller) => controller.abort());
    this.activeOperations.clear();
  }

  revokeUrls(urls: string[]): void {
    urls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}
