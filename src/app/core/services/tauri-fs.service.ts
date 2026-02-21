import { Injectable } from '@angular/core';
import type { OpenDialogOptions, SaveDialogOptions } from '../models/pdf-file.model';

export interface ITauriFsService {
  isTauri(): boolean;
  openFilePicker(options?: OpenDialogOptions): Promise<string[] | null>;
  saveFilePicker(options?: SaveDialogOptions): Promise<string | null>;
  openFolderPicker(): Promise<string | null>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  downloadFile(data: Uint8Array, filename: string, mimeType?: string): void;
}

@Injectable({ providedIn: 'root' })
export class TauriFsService implements ITauriFsService {
  isTauri(): boolean {
    return false;
  }

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

  async saveFilePicker(options?: SaveDialogOptions): Promise<string | null> {
    // In web mode, we don't have native save dialogs, so return null
    // This forces caller stores to fallback to the browser's download prompt.
    return null;
  }

  async openFolderPicker(): Promise<string | null> {
    return null;
  }

  async writeFile(path: string, data: Uint8Array): Promise<void> {
    console.log('Writing file to:', path, 'Size:', data.length);
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
