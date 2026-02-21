import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressOverlayComponent } from '../../shared/components/progress-overlay/progress-overlay.component';
import { OrganizerStore } from './organizer.store';
import { PageCardComponent } from './page-card.component';
import { PageItem } from '../../core/models/page-item.model';

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [CommonModule, DragDropModule, DropZoneComponent, ProgressOverlayComponent, PageCardComponent],
  providers: [OrganizerStore],
  styles: [`
    .page-header { margin-bottom: 32px; }
    .eyebrow { font-family:var(--mono); font-size:11px; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:8px; }
    h1 { font-size:36px; font-weight:800; letter-spacing:-.03em; color:var(--text); line-height:1.05; }
    .sub { font-size:14px; color:var(--text-2); margin-top:8px; }

    .toolbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:12px 16px; border-radius:12px; margin-bottom:20px;
      background:var(--surface); border:1px solid var(--border); box-shadow:var(--shadow-sm);
    }
    .file-info { display:flex; align-items:center; gap:12px; }
    .file-icon {
      width:38px; height:38px; border-radius:10px; flex-shrink:0;
      background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.15);
      color:#EF4444; display:flex; align-items:center; justify-content:center;
      font-family:var(--mono); font-size:10px; font-weight:800;
    }
    .file-name { font-size:14px; font-weight:700; color:var(--text); }
    .file-meta { font-family:var(--mono); font-size:11px; color:var(--text-3); margin-top:1px; }

    .toolbar-actions { display:flex; align-items:center; gap:8px; }

    /* Zoom controls */
    .zoom-ctrl {
      display:flex; align-items:center; gap:4px; padding:4px;
      background:var(--surface-2); border-radius:8px; border:1px solid var(--border);
    }
    .zoom-btn {
      width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center;
      color:var(--text-2); font-size:13px; cursor:pointer; font-weight:700;
      transition:background .12s, color .12s;
    }
    .zoom-btn:hover:not(:disabled) { background:var(--surface); color:var(--text); }
    .zoom-btn:disabled { opacity:.35; cursor:not-allowed; }
    .zoom-val { font-family:var(--mono); font-size:12px; font-weight:600; color:var(--text-3); min-width:20px; text-align:center; }

    /* Selection toolbar */
    .sel-bar {
      display:flex; align-items:center; justify-content:space-between;
      padding:10px 16px; border-radius:10px; margin-bottom:16px;
      background:var(--accent-subtle); border:1px solid var(--accent-border);
    }
    .sel-count { font-size:13px; font-weight:700; color:var(--accent); }
    .sel-actions { display:flex; align-items:center; gap:4px; }
    .sel-btn {
      display:flex; align-items:center; gap:6px; padding:7px 12px; border-radius:8px;
      font-size:12px; font-weight:600; cursor:pointer;
      transition:background .12s, color .12s;
    }
    .sel-btn.rotate { color:var(--text-2); }
    .sel-btn.rotate:hover { background:var(--surface-3); color:var(--text); }
    .sel-btn.delete { color:var(--red); }
    .sel-btn.delete:hover { background:var(--red-subtle); }
    .sel-btn.deselect { color:var(--text-3); }
    .sel-btn.deselect:hover { background:var(--surface-3); color:var(--text-2); }

    /* Page grid */
    .pages-grid {
      display:grid; gap:14px;
    }
    .drag-placeholder {
      border:2px dashed var(--accent); border-radius:10px; min-height:180px;
      background:var(--accent-subtle); opacity:.6;
    }

    .footer-row {
      display:flex; justify-content:flex-end; margin-top:24px;
    }
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
        <h1>Düzenle</h1>
        <p class="sub">Sayfaları yeniden sıralayın, döndürün veya kaldırın.</p>
      </header>

      @if (!store.file()) {
        <app-drop-zone
          [multiple]="false"
          [title]="'PDF Dosyası Seçin'"
          (files)="onFileSelected($event)"
        />
      } @else {

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="file-info">
            <div class="file-icon">PDF</div>
            <div>
              <div class="file-name">{{ store.file()!.name }}</div>
              <div class="file-meta">{{ store.pages().length }} sayfa</div>
            </div>
          </div>

          <div class="toolbar-actions">
            <!-- Zoom controls -->
            <div class="zoom-ctrl">
              <button class="zoom-btn" (click)="zoomIn()" [disabled]="zoomLevel() <= 2" title="Küçült">−</button>
              <span class="zoom-val">{{ zoomLevel() }}</span>
              <button class="zoom-btn" (click)="zoomOut()" [disabled]="zoomLevel() >= 10" title="Büyüt">+</button>
            </div>
            <button class="btn-ghost danger" (click)="store.clearFile()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Yeni Dosya
            </button>
          </div>
        </div>

        <!-- Selection toolbar -->
        @if (store.selectedCount() > 0) {
          <div class="sel-bar">
            <span class="sel-count">{{ store.selectedCount() }} sayfa seçili</span>
            <div class="sel-actions">
              <button class="sel-btn rotate" (click)="store.rotateSelected(-90)" title="Sola Döndür">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Sola
              </button>
              <button class="sel-btn rotate" (click)="store.rotateSelected(90)" title="Sağa Döndür">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Sağa
              </button>
              <button class="sel-btn delete" (click)="store.deleteSelected()" title="Seçilenleri Sil">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Sil
              </button>
              <button class="sel-btn deselect" (click)="store.deselectAll()">Seçimi Kaldır</button>
            </div>
          </div>
        }

        <!-- Page grid (drag & drop) -->
        <div class="pages-grid"
             [style.grid-template-columns]="gridColumns()"
             cdkDropList
             cdkDropListOrientation="mixed"
             [cdkDropListData]="store.pages()"
             (cdkDropListDropped)="onDrop($event)">
          @for (page of store.pages(); track page.id) {
            <div class="cursor-grab" cdkDrag [cdkDragData]="page">
              <div class="drag-placeholder" *cdkDragPlaceholder></div>
              <app-page-card
                [pageNumber]="page.pageNumber"
                [thumbnailUrl]="page.thumbnailUrl"
                [selected]="page.selected"
                [loading]="page.loading"
                [rotation]="page.rotation"
                (toggleSelect)="store.togglePageSelection(page.id)"
                (delete)="store.togglePageSelection(page.id); store.deleteSelected()"
              />
            </div>
          }
        </div>

        <!-- Save action -->
        <div class="footer-row">
          <button class="btn-accent" [disabled]="store.isProcessing()" (click)="store.save()">
            @if (store.isProcessing()) {
              <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Kaydediliyor...
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>
              </svg>
              PDF'i Kaydet
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            }
          </button>
        </div>
      }

      @if (store.isProcessing()) {
        <app-progress-overlay [progress]="store.progress()" message="İşleniyor..." (cancel)="store.cancel()" />
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
export class OrganizerComponent {
  store = inject(OrganizerStore);
  zoomLevel = signal(4);

  gridColumns = computed(() => {
    const z = this.zoomLevel();
    const minSize = 560 - (10 - z) * 46.67;
    return `repeat(auto-fill, minmax(${minSize}px, 1fr))`;
  });

  thumbnailWidth = computed(() => Math.round(200 + (10 - this.zoomLevel()) * 150));

  zoomIn() {
    if (this.zoomLevel() > 2) { this.zoomLevel.update(z => z - 1); this.store.rerenderThumbnails(this.thumbnailWidth()); }
  }

  zoomOut() {
    if (this.zoomLevel() < 10) { this.zoomLevel.update(z => z + 1); this.store.rerenderThumbnails(this.thumbnailWidth()); }
  }

  async onFileSelected(files: File[]) {
    if (files[0]) await this.store.setFile(files[0], this.thumbnailWidth());
  }

  onDrop(event: CdkDragDrop<PageItem[]>) {
    const pages = [...this.store.pages()];
    moveItemInArray(pages, event.previousIndex, event.currentIndex);
    this.store.reorderPages(pages);
  }
}
