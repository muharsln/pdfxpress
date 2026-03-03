import { Injectable } from '@angular/core';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
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

  async splitPdf(file: File, ranges: PageRange[], filenamePrefix: string): Promise<SplitResult[]> {
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
    rotations: Map<number, number>,
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

  async editTextInPdf(
    file: File,
    edits: {
      pageNumber: number;
      viewportWidth: number;
      actions: import('../models/worker-types').EditAction[];
    }[],
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Embed a standard font to write with
    const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const editPage of edits) {
      // pdf-lib pages are 0-indexed while our UI pageNumbers are 1-indexed
      const page = pdfDoc.getPage(editPage.pageNumber - 1);
      const { width, height } = page.getSize();

      const scaleRef = width / editPage.viewportWidth;

      for (const action of editPage.actions) {
        const item = action.originalTextItem;

        const nativeX = item.x * scaleRef;
        const nativeW = item.width * scaleRef;
        const nativeH = item.height * scaleRef;
        // pdf-lib origin is bottom-left. Extracted Y is relative to viewport top.
        // We revert Y back to bottom-left native space.
        const nativeY = height - (item.y + item.height) * scaleRef;

        // 1. Redact: Draw a white box over the old text
        page.drawRectangle({
          x: nativeX,
          y: nativeY,
          width: nativeW + nativeH * 0.2, // slight over-erase pad
          height: nativeH + nativeH * 0.2,
          color: rgb(1, 1, 1),
        });

        // 2. Overlay new text.
        page.drawText(action.newText, {
          x: nativeX,
          y: nativeY + nativeH * 0.2,
          size: nativeH * 0.8,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    return pdfDoc.save();
  }

  async getPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
  }
}
