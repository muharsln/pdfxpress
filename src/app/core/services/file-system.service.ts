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
          resolve(files.map((f) => f.name));
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  downloadFile(data: Uint8Array, filename: string, mimeType = 'application/pdf'): void {
    // Sanitize filename to prevent OS silent download failures for long/invalid names
    // eslint-disable-next-line no-control-regex
    let safeName = filename.replaceAll(/[<>:"/\\|*?\x00-\x1F]/g, '_');

    // Windows path limit max safe boundary is ~255, we restrict to 120 chars to be extremely safe
    const match = safeName.match(/^(.*)(\.[a-zA-Z0-9]+)$/);
    if (match) {
      let base = match[1];
      const ext = match[2];
      if (base.length > 120) base = base.substring(0, 120);
      safeName = base + ext;
    } else if (safeName.length > 120) {
      safeName = safeName.substring(0, 120);
    }

    const blob = new Blob([new Uint8Array(data)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}
