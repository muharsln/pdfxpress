import { Injectable } from '@angular/core';
import { PDFDocument, degrees } from 'pdf-lib';
import type { PageRange, SplitResult } from '../../core/models/worker-types';

@Injectable({ providedIn: 'root' })
export class PdfLibService {
  async mergePdfs(files: File[], onProgress: (pct: number) => void): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();
    const totalFiles = files.length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      for (const page of pages) {
        mergedPdf.addPage(page);
      }
      
      onProgress(Math.round(((i + 1) / totalFiles) * 100));
    }
    
    return mergedPdf.save();
  }

  async splitPdf(
    file: File, 
    ranges: PageRange[], 
    filenamePrefix: string
  ): Promise<SplitResult[]> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results: SplitResult[] = [];
    
    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const pageIndices = [];
      
      for (let i = range.start - 1; i < range.end; i++) {
        pageIndices.push(i);
      }
      
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }
      
      const data = await newPdf.save();
      const filename = `${filenamePrefix}_p${range.start}-p${range.end}.pdf`;
      
      results.push({
        filename,
        pages: range,
        data: new Uint8Array(data),
      });
    }
    
    return results;
  }

  async organizePdf(
    file: File,
    pageOrder: number[],
    rotations: Map<number, number>
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    
    for (const originalIndex of pageOrder) {
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [originalIndex]);
      const rotation = rotations.get(originalIndex) || 0;
      
      if (rotation !== 0) {
        const currentRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(currentRotation + rotation));
      }
      
      newPdf.addPage(copiedPage);
    }
    
    return newPdf.save();
  }

  async getPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
  }
}
