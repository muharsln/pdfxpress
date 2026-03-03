import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface IPdfRenderService {
  renderPage(
    file: File,
    pageNumber: number,
    width: number,
    format?: string,
    quality?: number,
  ): Promise<string>;
  renderAllPages(
    file: File,
    width: number,
    format?: string,
    quality?: number,
    onProgress?: (current: number, total: number) => void,
  ): Promise<Map<number, string>>;
  extractTextContent(
    file: File,
    pageNumber: number,
    width: number,
  ): Promise<import('../models/worker-types').TextItem[]>;
  cancelAll(): void;
  revokeUrls(urls: string[]): void;
}

@Injectable({ providedIn: 'root' })
export class PdfRenderService implements IPdfRenderService {
  private readonly activeOperations = new Map<number, AbortController>();

  async renderPage(
    file: File,
    pageNumber: number,
    width: number,
    format = 'jpeg',
    quality = 0.8,
  ): Promise<string> {
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

    return canvas.toDataURL(`image/${format}`, quality);
  }

  async renderAllPages(
    file: File,
    width: number,
    format = 'jpeg',
    quality = 0.8,
    onProgress?: (current: number, total: number) => void,
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

      results.set(i, canvas.toDataURL(`image/${format}`, quality));
      onProgress?.(i, totalPages);
    }

    return results;
  }

  async extractTextContent(
    file: File,
    pageNumber: number,
    width: number,
  ): Promise<import('../models/worker-types').TextItem[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);

    // Get the viewport for the desired rendering width
    const scale = width / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    // Extract text items from PDF
    const textContent = await page.getTextContent();
    const items: import('../models/worker-types').TextItem[] = [];

    interface PdfTextItem {
      str: string;
      transform: number[];
      width: number;
      fontName: string;
    }
    (textContent.items as unknown as PdfTextItem[]).forEach((item, index: number) => {
      // item.transform represents the [scaleX, skewY, skewX, scaleY, translateX, translateY] matrix
      // pdf.js uses a custom matrix system which we must map to our exact viewport scale
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const fontHeight = Math.hypot(tx[2], tx[3]);
      const fontAscent = fontHeight; // Approximation for ascent/height

      // Calculate pixel X and Y on our viewport. Note: pdf.js calculates Y from the bottom up,
      // but the viewport.transform applies the matrix to fix it from top-down for canvas
      const px = tx[4];
      const py = tx[5] - fontAscent; // Adjust Y up by height since text renders at baseline

      items.push({
        id: `text-${pageNumber}-${index}`,
        text: item.str,
        x: px,
        y: py,
        width: item.width * scale, // Map raw PDF units to scaled width
        height: fontHeight, // Height is the scaled font size
        fontFamily: item.fontName || 'sans-serif',
        fontSize: fontHeight,
      });
    });

    return items;
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
