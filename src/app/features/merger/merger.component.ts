import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressOverlayComponent } from '../../shared/components/progress-overlay/progress-overlay.component';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { MergerStore } from './merger.store';
import { PdfFile } from '../../core/models/pdf-file.model';

@Component({
  selector: 'app-merger',
  standalone: true,
  imports: [CommonModule, DragDropModule, DropZoneComponent, ProgressOverlayComponent, FileSizePipe],
  providers: [MergerStore],
  styles: [`
    .page-header { margin-bottom: 32px; }
    .eyebrow {
      font-family: var(--mono); font-size: 11px; font-weight: 500;
      letter-spacing: .12em; text-transform: uppercase;
      color: var(--accent); margin-bottom: 8px;
    }
    h1 {
      font-size: 36px; font-weight: 800; letter-spacing: -.03em;
      color: var(--text); line-height: 1.05;
    }
    .sub { font-size: 14px; color: var(--text-2); margin-top: 8px; }

    .file-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--surface);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; padding: 0 8px;
      border-radius: 8px; background: var(--accent);
      font-family: var(--mono); font-size: 12px; font-weight: 700;
      color: #fff;
    }
    .card-header-left { display: flex; align-items: center; gap: 10px; }
    .card-header-title { font-size: 13px; font-weight: 700; color: var(--text-2); }
    .card-stat { font-family: var(--mono); font-size: 12px; color: var(--text-3); }

    .file-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      transition: background .12s;
    }
    .file-row:last-child { border-bottom: none; }
    .file-row:hover { background: var(--surface-2); }

    .row-num {
      font-family: var(--mono); font-size: 11px; color: var(--text-4);
      width: 20px; text-align: center; flex-shrink: 0;
    }
    .pdf-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.15);
      color: #EF4444;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--mono); font-size: 10px; font-weight: 800;
      flex-shrink: 0;
    }
    .file-info { flex: 1; min-width: 0; }
    .file-name { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-meta { font-family: var(--mono); font-size: 11px; color: var(--text-3); margin-top: 1px; }

    .drag-handle {
      cursor: grab; color: var(--text-4);
      padding: 4px; border-radius: 6px;
      transition: color .12s, background .12s; flex-shrink: 0;
    }
    .drag-handle:hover { color: var(--text-2); background: var(--surface-3); }
    .drag-handle:active { cursor: grabbing; }

    .remove-btn {
      opacity: 0; padding: 6px; border-radius: 8px;
      color: var(--text-3); flex-shrink: 0;
      transition: opacity .12s, background .12s, color .12s;
    }
    .file-row:hover .remove-btn { opacity: 1; }
    .remove-btn:hover { background: var(--red-subtle); color: var(--red); }

    .card-footer { padding: 16px 20px; border-top: 1px solid var(--border); background: var(--surface-2); }
    .footer-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
    .total-label { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--text-3); }
    .total-val { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.02em; line-height: 1; margin-top: 2px; }
    .total-val span { font-size: 13px; font-weight: 600; color: var(--text-2); margin-left: 4px; }

    .error-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-radius: 10px;
      border: 1px solid rgba(239,68,68,.2);
      background: var(--red-subtle); color: var(--red);
      font-size: 13px; font-weight: 600;
    }
  `],
  template: `
    <div class="animate-slide-up">

      <!-- Header -->
      <header class="page-header">
        <p class="eyebrow">PDF Araçları</p>
        <h1>Birleştir</h1>
        <p class="sub">PDF dosyalarını istediğiniz sıraya dizin, tek belgede birleştirin.</p>
      </header>

      <!-- Empty state -->
      @if (store.files().length === 0) {
        <app-drop-zone
          [multiple]="true"
          [title]="'PDF Dosyası Sürükleyin'"
          (files)="addFiles($event)"
        />
      }

      <!-- File list -->
      @if (store.files().length > 0) {
        <div class="file-card">

          <!-- Card header -->
          <div class="card-header">
            <div class="card-header-left">
              <span class="badge">{{ store.fileCount() }}</span>
              <span class="card-header-title">Dosya seçildi</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <span class="card-stat">{{ store.totalPages() }} sayfa toplam</span>
              <button class="btn-ghost danger" (click)="store.clearFiles()">Tümünü sil</button>
            </div>
          </div>

          <!-- Drag list -->
          <div cdkDropList (cdkDropListDropped)="drop($event)">
            @for (file of store.files(); track file.id; let i = $index) {
              <div cdkDrag class="file-row">

                <span class="row-num">{{ i + 1 }}</span>

                <div class="pdf-icon">PDF</div>

                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ file.pageCount }} sayfa · {{ file.size | fileSize }}</div>
                </div>

                <span cdkDragHandle class="drag-handle" title="Sıra değiştir">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="5.5" cy="3" r="1.2"/><circle cx="10.5" cy="3" r="1.2"/>
                    <circle cx="5.5" cy="8" r="1.2"/><circle cx="10.5" cy="8" r="1.2"/>
                    <circle cx="5.5" cy="13" r="1.2"/><circle cx="10.5" cy="13" r="1.2"/>
                  </svg>
                </span>

                <button class="remove-btn" (click)="store.removeFile(file.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Footer: add more + merge action -->
          <div class="card-footer">
            <app-drop-zone [compact]="true" [title]="'Daha fazla dosya ekle'" [multiple]="true" (files)="addFiles($event)" />
            <div class="footer-actions">
              <div>
                <div class="total-label">Toplam</div>
                <div class="total-val">{{ store.totalPages() }}<span>sayfa</span></div>
              </div>
              <button class="btn-accent"
                      [disabled]="store.files().length < 2 || store.isProcessing()"
                      (click)="store.merge()">
                @if (store.isProcessing()) {
                  <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  İşleniyor...
                } @else {
                  PDF'leri Birleştir
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                  </svg>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Processing -->
      @if (store.isProcessing()) {
        <app-progress-overlay [progress]="store.progress()" message="Birleştiriliyor..." (cancel)="store.cancel()" />
      }

      <!-- Error -->
      @if (store.error()) {
        <div class="error-bar" style="margin-top:16px;">
          <span>{{ store.error() }}</span>
          <button class="btn-ghost" (click)="store.clearError()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }

    </div>
  `
})
export class MergerComponent {
  store = inject(MergerStore);

  async addFiles(files: File[]) { await this.store.addFiles(files); }

  drop(e: CdkDragDrop<PdfFile[]>) {
    const files = [...this.store.files()];
    moveItemInArray(files, e.previousIndex, e.currentIndex);
    this.store.reorderFiles(files);
  }
}
