import { Injectable } from '@angular/core';
import type { OpenDialogOptions } from '../models/pdf-file.model';

export interface IFileSystemService {
  openFilePicker(options?: OpenDialogOptions): Promise<string[] | null>;
  downloadFile(data: Uint8Array, filename: string, mimeType?: string): void;
}

@Injectable({ providedIn: 'root' })
export class FileSystemService implements IFileSystemService {
  async openFilePicker(options?: OpenDialogOptions): Promise<string[] | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options?.filters?.[0]?.extensions?.[0]
        ? `.${options.filters[0].extensions[0]}`
        : '.pdf';
      input.multiple = options?.multiple ?? true;

      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          const files = Array.from(input.files);
          resolve(files.map(f => f.name));
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  downloadFile(data: Uint8Array, filename: string, mimeType: string = 'application/pdf'): void {
    const blob = new Blob([new Uint8Array(data)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
