import { InjectionToken } from '@angular/core';
import type { PageRange, SplitResult } from '../models/pdf-file.model';

export interface IPdfService {
  mergePdfs(files: File[], onProgress: (pct: number) => void): Promise<Uint8Array>;
  splitPdf(file: File, ranges: PageRange[], filenamePrefix: string): Promise<SplitResult[]>;
  organizePdf(
    file: File,
    pageOrder: number[],
    rotations: Map<number, number>
  ): Promise<Uint8Array>;
  getPageCount(file: File): Promise<number>;
}

export const PDF_SERVICE = new InjectionToken<IPdfService>('PDF_SERVICE');
