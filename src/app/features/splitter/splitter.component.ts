import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressOverlayComponent } from '../../shared/components/progress-overlay/progress-overlay.component';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { SplitterStore } from './splitter.store';
import { PageRange } from '../../core/models/worker-types';

@Component({
  selector: 'app-splitter',
  standalone: true,
  imports: [CommonModule, FormsModule, DropZoneComponent, ProgressOverlayComponent, FileSizePipe],
  providers: [SplitterStore],
  styles: [`
    .page-header { margin-bottom: 32px; }
    .eyebrow { font-family:var(--mono); font-size:11px; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:8px; }
    h1 { font-size:36px; font-weight:800; letter-spacing:-.03em; color:var(--text); line-height:1.05; }
    .sub { font-size:14px; color:var(--text-2); margin-top:8px; }

    .file-preview {
      display:flex; align-items:center; gap:16px;
      padding:16px 20px; border-radius:14px;
      background:var(--surface); border:1px solid var(--border);
      box-shadow:var(--shadow-sm); margin-bottom:24px;
    }
    .file-icon {
      width:48px; height:48px; border-radius:12px; flex-shrink:0;
      background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.15);
      color:#EF4444; display:flex; align-items:center; justify-content:center;
      font-family:var(--mono); font-size:11px; font-weight:800;
    }
    .file-name { font-size:15px; font-weight:700; color:var(--text); }
    .file-meta { font-family:var(--mono); font-size:12px; color:var(--text-3); margin-top:2px; }

    .section { margin-bottom:20px; }
    .section-title { font-size:13px; font-weight:700; color:var(--text-2); margin-bottom:10px; letter-spacing:-.01em; }

    /* Mode tabs */
    .tab-bar {
      display:flex; gap:4px; padding:4px;
      background:var(--surface-2); border-radius:12px;
      border:1px solid var(--border); margin-bottom:24px;
    }
    .tab {
      flex:1; padding:9px 12px; border-radius:8px;
      font-size:13px; font-weight:600; cursor:pointer;
      transition:all .15s; color:var(--text-3); text-align:center;
    }
    .tab.active { background:var(--surface); color:var(--accent); box-shadow:var(--shadow-sm); }
    .tab:not(.active):hover { color:var(--text-2); background:var(--surface); }

    .input-group { display:flex; flex-direction:column; gap:6px; }
    .input-label { font-size:13px; font-weight:600; color:var(--text-2); }
    .input-hint { font-size:12px; color:var(--text-3); margin-top:4px; }

    .field {
      width:100%; padding:11px 14px;
      background:var(--surface); border:1px solid var(--border);
      border-radius:10px; color:var(--text); font-size:14px;
      font-family:var(--font); outline:none;
      transition:border-color .15s, box-shadow .15s;
    }
    .field:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-subtle); }

    .info-box {
      display:flex; align-items:center; gap:12px; padding:14px 16px;
      background:var(--accent-subtle); border:1px solid var(--accent-border);
      border-radius:10px; color:var(--text-2); font-size:13px;
    }

    .preview-card {
      background:var(--surface); border:1px solid var(--border);
      border-radius:14px; overflow:hidden; margin-bottom:24px;
    }
    .preview-header {
      display:flex; align-items:center; justify-content: space-between;
      padding:14px 20px; border-bottom:1px solid var(--border);
      background:var(--surface-2);
    }
    .preview-header-title { font-size:13px; font-weight:700; color:var(--text-2); }
    .preview-count {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:24px; height:24px; padding:0 8px;
      border-radius:6px; background:var(--accent);
      font-family:var(--mono); font-size:11px; font-weight:700; color:#fff;
    }
    .preview-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:10px 20px; border-bottom:1px solid var(--border); font-size:13px;
    }
    .preview-row:last-child { border-bottom:none; }
    .preview-filename { color:var(--accent); font-weight:600; }
    .preview-pages { font-family:var(--mono); color:var(--text-3); }

    .prefix-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }

    .actions { display:flex; justify-content:flex-end; }
    .error-bar {
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 16px; border-radius:10px; margin-top:16px;
      border:1px solid rgba(239,68,68,.2); background:var(--red-subtle); color:var(--red);
      font-size:13px; font-weight:600;
    }
  `],
  template: `
    <div class="animate-slide-up">

      <header class="page-header">
        <p class="eyebrow">PDF Araçları</p>
        <h1>Böl</h1>
        <p class="sub">Sayfaları aralıklara göre çıkarın veya her sayfayı ayrı dosyaya bölün.</p>
      </header>

      @if (!store.file()) {
        <app-drop-zone
          [multiple]="false"
          [title]="'PDF Dosyası Seçin'"
          (files)="onFileSelected($event)"
        />
      } @else {

        <!-- Selected file preview -->
        <div class="file-preview">
          <div class="file-icon">PDF</div>
          <div style="flex:1;min-width:0;">
            <div class="file-name">{{ store.file()!.name }}</div>
            <div class="file-meta">{{ store.file()!.pageCount }} sayfa · {{ store.file()!.size | fileSize }}</div>
          </div>
          <button class="btn-ghost danger" (click)="store.clearFile()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Değiştir
          </button>
        </div>

        <!-- Mode tabs -->
        <div class="tab-bar">
          <button class="tab" [class.active]="store.mode() === 'range'"  (click)="store.setMode('range')">Aralık</button>
          <button class="tab" [class.active]="store.mode() === 'burst'"  (click)="store.setMode('burst')">Her Sayfa Ayrı</button>
          <button class="tab" [class.active]="store.mode() === 'fixed'"  (click)="store.setMode('fixed')">Sabit Boyut</button>
        </div>

        <!-- Mode options -->
        @switch (store.mode()) {
          @case ('range') {
            <div class="section">
              <div class="input-group">
                <label class="input-label">Sayfa Aralıkları</label>
                <input class="field" type="text" placeholder="örn: 1, 3-5, 10-son"
                       [ngModel]="store.rangeInput()" (ngModelChange)="store.setRangeInput($event)">
                <p class="input-hint">Aralıkları virgülle ayırın. Son sayfa için "son" kullanın.</p>
              </div>
            </div>
          }
          @case ('burst') {
            <div class="section">
              <div class="info-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                Her sayfa ayrı bir PDF dosyası olarak kaydedilecek (toplam {{ store.file()!.pageCount }} dosya).
              </div>
            </div>
          }
          @case ('fixed') {
            <div class="section">
              <div class="input-group">
                <label class="input-label">Her Dosya İçin Sayfa Sayısı</label>
                <input class="field" type="number" min="1" [max]="store.file()!.pageCount"
                       [ngModel]="store.fixedSize()" (ngModelChange)="store.setFixedSize($event)">
              </div>
            </div>
          }
        }

        <!-- Prefix + preview grid -->
        <div class="prefix-row">
          <div class="input-group">
            <label class="input-label">Çıktı Dosya Adı Öneki</label>
            <input class="field" type="text"
                   [ngModel]="store.filenamePrefix()" (ngModelChange)="store.setFilenamePrefix($event)">
          </div>
        </div>

        <!-- Output preview -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-header-title">Oluşturulacak Dosyalar</span>
            <span class="preview-count">{{ previewFiles().length }}</span>
          </div>
          <div style="max-height:220px;overflow-y:auto;">
            @for (f of previewFiles(); track f.filename) {
              <div class="preview-row">
                <span class="preview-filename">{{ f.filename }}</span>
                <span class="preview-pages">Sayfalar: {{ f.pages }}</span>
              </div>
            }
          </div>
        </div>

        <div class="actions">
          <button class="btn-accent" [disabled]="store.isProcessing() || previewFiles().length === 0" (click)="store.split()">
            @if (store.isProcessing()) {
              <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              İşleniyor...
            } @else {
              PDF'i Böl
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            }
          </button>
        </div>
      }

      @if (store.isProcessing()) {
        <app-progress-overlay [progress]="store.progress()" message="PDF bölünüyor..." (cancel)="store.cancel()" />
      }

      @if (store.error()) {
        <div class="error-bar">
          <span>{{ store.error() }}</span>
          <button class="btn-ghost" (click)="store.clearError()">Kapat</button>
        </div>
      }
    </div>
  `
})
export class SplitterComponent {
  store = inject(SplitterStore);

  previewFiles = computed(() => {
    const file = this.store.file();
    if (!file) return [];
    if (this.store.mode() === 'burst') {
      return Array.from({ length: file.pageCount }, (_, i) => ({
        filename: `${this.store.filenamePrefix()}_p${i + 1}.pdf`,
        pages: `${i + 1}`,
      }));
    }
    if (this.store.mode() === 'fixed') {
      const ranges: { start: number; end: number }[] = [];
      const size = this.store.fixedSize();
      for (let i = 1; i <= file.pageCount; i += size) {
        ranges.push({ start: i, end: Math.min(i + size - 1, file.pageCount) });
      }
      return ranges.map(r => ({
        filename: `${this.store.filenamePrefix()}_p${r.start}-p${r.end}.pdf`,
        pages: `${r.start} - ${r.end}`,
      }));
    }
    const ranges = this.parseRanges(this.store.rangeInput(), file.pageCount);
    return ranges.map(r => ({
      filename: `${this.store.filenamePrefix()}_p${r.start}-p${r.end}.pdf`,
      pages: `${r.start} - ${r.end}`,
    }));
  });

  async onFileSelected(files: File[]) {
    if (files[0]) await this.store.setFile(files[0]);
  }

  private parseRanges(input: string, maxPages: number): PageRange[] {
    const ranges: PageRange[] = [];
    for (const part of input.split(',').map(s => s.trim())) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = endStr.toLowerCase() === 'son' || endStr.toLowerCase() === 'end'
          ? maxPages : parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end)
          ranges.push({ start, end });
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page > 0 && page <= maxPages) ranges.push({ start: page, end: page });
      }
    }
    return ranges.sort((a, b) => a.start - b.start);
  }
}
