import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressOverlayComponent } from '../../shared/components/progress-overlay/progress-overlay.component';
import { ConverterStore } from './converter.store';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, DropZoneComponent, ProgressOverlayComponent],
  providers: [ConverterStore],
  styles: [`
    .page-header { margin-bottom: 32px; }
    .eyebrow { font-family:var(--mono); font-size:11px; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:8px; }
    h1 { font-size:36px; font-weight:800; letter-spacing:-.03em; color:var(--text); line-height:1.05; }
    .sub { font-size:14px; color:var(--text-2); margin-top:8px; }

    /* Direction tabs */
    .mode-tabs {
      display:grid; grid-template-columns:1fr 1fr; gap:4px;
      padding:4px; background:var(--surface-2);
      border:1px solid var(--border); border-radius:14px; margin-bottom:28px;
    }
    .mode-tab {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:14px 16px; border-radius:10px; cursor:pointer;
      font-size:14px; font-weight:600; color:var(--text-3);
      transition:all .15s; text-align:center;
    }
    .mode-tab.active {
      background:var(--surface); color:var(--accent);
      box-shadow:var(--shadow-sm); border:1px solid var(--border);
    }
    .mode-tab:not(.active):hover { color:var(--text-2); background:rgba(255,255,255,.04); }
    .mode-tab .tab-icon { opacity:.5; transition:opacity .15s; }
    .mode-tab.active .tab-icon { opacity:1; }

    .file-preview {
      display:flex; align-items:center; gap:16px; padding:16px 20px;
      border-radius:14px; background:var(--surface); border:1px solid var(--border);
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

    .options-card {
      background:var(--surface); border:1px solid var(--border);
      border-radius:14px; padding:20px; margin-bottom:24px;
      box-shadow:var(--shadow-sm);
    }
    .options-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .option-group { display:flex; flex-direction:column; gap:6px; }
    .option-label { font-size:13px; font-weight:600; color:var(--text-2); }

    .field {
      width:100%; padding:11px 14px; background:var(--surface-2);
      border:1px solid var(--border); border-radius:10px;
      color:var(--text); font-size:14px; font-family:var(--font);
      outline:none; transition:border-color .15s, box-shadow .15s;
    }
    .field:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-subtle); }

    .quality-row { display:flex; align-items:center; gap:12px; }
    .quality-slider { flex:1; accent-color:var(--accent); cursor:pointer; }
    .quality-val {
      font-family:var(--mono); font-size:12px; font-weight:600;
      color:var(--accent); min-width:36px; text-align:right;
    }

    /* Range input */
    .range-row { margin-bottom:20px; }
    .input-hint { font-size:12px; color:var(--text-3); margin-top:4px; }

    /* Image grid */
    .images-card {
      background:var(--surface); border:1px solid var(--border);
      border-radius:14px; overflow:hidden; margin-bottom:24px;
    }
    .images-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 20px; border-bottom:1px solid var(--border); background:var(--surface-2);
    }
    .images-count {
      display:inline-flex; align-items:center; gap:8px;
      font-size:13px; font-weight:700; color:var(--text-2);
    }
    .images-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr));
      gap:12px; padding:20px; max-height:280px; overflow-y:auto;
    }
    .image-thumb { border-radius:8px; overflow:hidden; }
    .image-thumb img { width:100%; aspect-ratio:1; object-fit:cover; }
    .image-thumb span { display:block; font-size:10px; color:var(--text-3); text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:4px 2px; }

    .badge-count {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:24px; height:24px; padding:0 8px; border-radius:6px;
      background:var(--accent); font-family:var(--mono); font-size:11px; font-weight:700; color:#fff;
    }
    .actions { display:flex; justify-content:flex-end; margin-top:4px; }
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
        <h1>Dönüştür</h1>
        <p class="sub">PDF'yi görsel formatlarına veya görselleri PDF'e dönüştürün.</p>
      </header>

      <!-- Direction mode selector -->
      <div class="mode-tabs">
        <button class="mode-tab" [class.active]="store.mode() === 'pdf-to-image'" (click)="store.setMode('pdf-to-image')">
          <svg class="tab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
            <line x1="9" y1="15" x2="15" y2="15"/><line x1="12" y1="18" x2="12" y2="12"/>
          </svg>
          <span>PDF'den Görsele</span>
          <span style="font-size:11px;font-family:var(--mono);color:var(--text-3);">PNG · JPEG · WebP</span>
        </button>
        <button class="mode-tab" [class.active]="store.mode() === 'image-to-pdf'" (click)="store.setMode('image-to-pdf')">
          <svg class="tab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
          <span>Görselden PDF'e</span>
          <span style="font-size:11px;font-family:var(--mono);color:var(--text-3);">JPG · PNG · WebP</span>
        </button>
      </div>

      <!-- PDF → Image mode -->
      @if (store.mode() === 'pdf-to-image') {
        @if (!store.pdfFile()) {
          <app-drop-zone [multiple]="false" [title]="'PDF Dosyası Seçin'" (files)="onPdfSelected($event)" />
        } @else {
          <div class="file-preview">
            <div class="file-icon">PDF</div>
            <div style="flex:1;min-width:0;">
              <div class="file-name">{{ store.pdfFile()!.name }}</div>
              <div class="file-meta">{{ store.pdfPageCount() }} sayfa</div>
            </div>
            <button class="btn-ghost danger" (click)="store.clearPdf()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Değiştir
            </button>
          </div>

          <div class="options-card">
            <div class="range-row">
              <div class="option-group">
                <label class="option-label">Sayfa Aralığı</label>
                <input class="field" type="text" placeholder="örn: 1, 3-5, 1-son"
                       [ngModel]="store.pdfRangeInput()" (ngModelChange)="store.setPdfRangeInput($event)">
                <p class="input-hint">Boş bırakırsanız tüm sayfalar dönüştürülür.</p>
              </div>
            </div>
            <div class="options-grid">
              <div class="option-group">
                <label class="option-label">Çıktı Formatı</label>
                <select class="field" [ngModel]="store.imageFormat()" (ngModelChange)="store.setImageFormat($event)">
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              <div class="option-group">
                <label class="option-label">Kalite</label>
                <div class="quality-row">
                  <input class="quality-slider" type="range" min="10" max="100"
                         [ngModel]="store.imageQuality()" (ngModelChange)="store.setImageQuality($event)">
                  <span class="quality-val">%{{ store.imageQuality() }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn-accent" [disabled]="store.isProcessing()" (click)="store.convertPdfToImages()">
              @if (store.isProcessing()) {
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Dönüştürülüyor...
              } @else {
                Görsellere Dönüştür
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              }
            </button>
          </div>
        }
      }

      <!-- Image → PDF mode -->
      @if (store.mode() === 'image-to-pdf') {
        @if (store.imageFiles().length === 0) {
          <app-drop-zone [multiple]="true" [accept]="'.jpg,.jpeg,.png,.webp,.gif,.bmp,image/*'" [title]="'Görsel Dosyaları Seçin'" (files)="onImagesSelected($event)" />
        } @else {
          <div class="images-card">
            <div class="images-header">
              <div class="images-count">
                <span class="badge-count">{{ store.imageFiles().length }}</span>
                görsel seçildi
              </div>
              <button class="btn-ghost danger" (click)="clearImages()">Tümünü sil</button>
            </div>
            <div class="images-grid">
              @for (file of store.imageFiles(); track file.name) {
                <div class="image-thumb">
                  <img [src]="getPreview(file)" [alt]="file.name">
                  <span>{{ file.name }}</span>
                </div>
              }
            </div>
          </div>

          <div class="actions">
            <button class="btn-accent" [disabled]="store.isProcessing() || store.imageFiles().length === 0" (click)="store.convertImagesToPdf()">
              @if (store.isProcessing()) {
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Oluşturuluyor...
              } @else {
                PDF Oluştur
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              }
            </button>
          </div>
        }
      }

      @if (store.isProcessing()) {
        <app-progress-overlay [progress]="store.progress()" message="Dönüştürülüyor..." (cancel)="store.cancel()" />
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
export class ConverterComponent {
  store = inject(ConverterStore);
  previewMap = new Map<File, string>();

  async onPdfSelected(files: File[]) {
    if (files[0]) await this.store.setPdfFile(files[0]);
  }

  onImagesSelected(files: File[]) {
    const imgs = files.filter(f => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.name));
    imgs.forEach(file => {
      if (!this.previewMap.has(file)) {
        this.previewMap.set(file, URL.createObjectURL(file));
      }
    });
    this.store.setImageFiles(imgs);
  }

  clearImages() {
    this.previewMap.forEach(url => URL.revokeObjectURL(url));
    this.previewMap.clear();
    this.store.clearImages();
  }

  getPreview(file: File): string {
    return this.previewMap.get(file) || '';
  }
}
