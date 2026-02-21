import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-drop-zone',
  standalone: true,
  host: { style: 'display:block;width:100%;' },
  template: `
    @if (!compact()) {
      <!-- Full drop zone -->
      <div class="dropzone" [class.over]="over()"
           (dragover)="onOver($event)" (dragleave)="onLeave($event)" (drop)="onDrop($event)"
           (click)="input.click()"
           style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;min-height:360px;text-align:center;">
        <input #input type="file" [accept]="accept()" [multiple]="multiple()" (change)="onSelect($event)" hidden>

        <!-- Icon with animation -->
        <div style="position:relative;">
          <!-- Ping ring on hover/over -->
          @if (over()) {
            <div class="animate-ping" style="position:absolute;inset:-12px;border-radius:50%;border:1.5px solid var(--accent);opacity:.5;"></div>
          }
          <div style="width:88px;height:88px;border-radius:24px;display:flex;align-items:center;justify-content:center;transition:all .25s var(--ease);"
               [style.background]="over() ? 'var(--accent)' : 'var(--surface-2)'"
               [style.color]="over() ? '#fff' : 'var(--text-3)'">
            @if (over()) {
              <!-- Arrow down on drag over -->
              <svg class="animate-slide-up" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19,12 12,19 5,12"/>
              </svg>
            } @else {
              <!-- PDF + upload icon when idle (floats) -->
              <div class="animate-float">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <polyline points="9,15 12,12 15,15"/>
                </svg>
              </div>
            }
          </div>
        </div>

        <!-- Text -->
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
          <p style="font-size:18px;font-weight:800;color:var(--text);letter-spacing:-.02em;">
            {{ over() ? 'Dosyaları Bırakın' : (title() || 'PDF Dosyası Sürükleyin') }}
          </p>
          <p style="font-size:13px;color:var(--text-3);">
            {{ over() ? '' : 'veya tıklayarak dosya seçin' }}
          </p>
        </div>

        <!-- Constraint pills -->
        @if (!over()) {
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="pill">PDF</span>
            <span style="color:var(--text-4);font-size:12px;">·</span>
            <span class="pill">Maks 100 MB</span>
            <span style="color:var(--text-4);font-size:12px;">·</span>
            <span class="pill">Çoklu dosya</span>
          </div>
        }
      </div>
    }

    @if (compact()) {
      <!-- Compact add-more zone -->
      <div class="dropzone" [class.over]="over()"
           (dragover)="onOver($event)" (dragleave)="onLeave($event)" (drop)="onDrop($event)"
           (click)="input.click()"
           style="display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;border-radius:10px;">
        <input #input type="file" [accept]="accept()" [multiple]="multiple()" (change)="onSelect($event)" hidden>
        <div style="width:28px;height:28px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--text-3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span style="font-size:13px;font-weight:600;color:var(--text-3);">{{ title() || 'Dosya ekle' }}</span>
      </div>
    }
  `
})
export class DropZoneComponent {
  files = output<File[]>();
  accept = input('.pdf');
  multiple = input(true);
  title = input('');
  compact = input(false);

  over = signal(false);

  onOver(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    this.over.set(true);
  }

  onLeave(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      this.over.set(false);
    }
  }

  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    this.over.set(false);
    const files = e.dataTransfer?.files;
    if (files?.length) this.files.emit(this.filter(Array.from(files)));
  }

  onSelect(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.files?.length) { this.files.emit(this.filter(Array.from(el.files))); el.value = ''; }
  }

  private filter(files: File[]) {
    const a = this.accept();
    if (!a || a === '*') return files;
    const exts = a.split(',').map(s => s.trim().toLowerCase());
    return files.filter(f => {
      const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
      return exts.some(e => e.startsWith('.') ? ext === e : f.type.toLowerCase().includes(e));
    });
  }
}
