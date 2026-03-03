import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressOverlayComponent } from '../../shared/components/progress-overlay/progress-overlay.component';
import { EditorStore } from './editor.store';
import { TextItem } from '../../core/models/worker-types';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, DropZoneComponent, ProgressOverlayComponent],
  providers: [EditorStore],
  styles: [
    `
      .page-header {
        margin-bottom: 32px;
      }
      .eyebrow {
        font-family: var(--mono);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 8px;
      }
      h1 {
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text);
        line-height: 1.05;
      }
      .sub {
        font-size: 14px;
        color: var(--text-2);
        margin-top: 8px;
      }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 12px;
        margin-bottom: 20px;
        background: var(--surface);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .file-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        flex-shrink: 0;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.15);
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 800;
      }
      .file-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
      }
      .file-meta {
        font-family: var(--mono);
        font-size: 11px;
        color: var(--text-3);
        margin-top: 1px;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .nav-ctrl {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        margin-right: 12px;
        background: var(--surface-2);
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      .nav-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-2);
        font-size: 13px;
        cursor: pointer;
        font-weight: 700;
        transition:
          background 0.12s,
          color 0.12s;
      }
      .nav-btn:hover:not(:disabled) {
        background: var(--surface);
        color: var(--text);
      }
      .nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .nav-val {
        font-family: var(--mono);
        font-size: 12px;
        font-weight: 600;
        color: var(--text-3);
        min-width: 60px;
        text-align: center;
      }

      .editor-canvas-wrapper {
        position: relative;
        margin: 0 auto;
        max-width: 100%;
        overflow: auto;
        padding: 24px;
        background: var(--surface-2);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        display: flex;
        justify-content: center;
      }

      .canvas-container {
        position: relative;
        background: white;
        box-shadow: var(--shadow-md);
        transform-origin: top center;
      }

      .bg-img {
        display: block;
        pointer-events: none;
      }

      .text-layer {
        position: absolute;
        inset: 0;
        pointer-events: auto;
      }

      .text-box {
        position: absolute;
        border: 1px dashed transparent;
        border-radius: 2px;
        cursor: text;
        transition:
          border-color 0.15s,
          background 0.15s;
      }

      .text-box:hover {
        border-color: var(--accent);
        background: var(--accent-subtle);
        opacity: 0.8;
      }

      .text-box.editing {
        border-color: var(--accent);
        background: #fff;
        box-shadow: 0 0 0 2px var(--accent-border);
        z-index: 10;
      }

      .text-box.edited {
        background: #fff; /* covers the original text */
        border: 1px solid var(--accent);
        z-index: 5;
      }

      .edited-text-span {
        display: block;
        width: 100%;
        height: 100%;
        color: var(--text);
        background: #fff;
      }

      .revert-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--red);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.15s;
        z-index: 20;
        box-shadow: var(--shadow-sm);
      }

      .text-box.edited:hover .revert-btn {
        opacity: 1;
      }

      .revert-btn:hover {
        transform: scale(1.15);
      }

      .text-input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        resize: none;
        padding: 0;
        margin: 0;
        color: var(--text);
        white-space: pre;
      }

      .warning-box {
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 24px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.2);
        color: #d97706;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        gap: 12px;
      }

      .footer-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
      }
    `,
  ],
  template: `
    <div class="animate-slide-up">
      <header class="page-header">
        <p class="eyebrow">PDF Araçları</p>
        <h1>Metin Düzenle</h1>
        <p class="sub">Belge içerisindeki mevcut metin bloklarını doğrudan düzenleyin.</p>
      </header>

      @if (!store.file()) {
        <app-drop-zone
          [multiple]="false"
          [title]="'Düzenlenecek PDF Seçin'"
          (files)="onFileSelected($event)"
        />
      } @else {
        <div class="warning-box">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            style="flex-shrink:0;"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Gelişmiş Metin Düzenleme (Beta): Orijinal fontlar cihazınızda yüklü değilse, değiştirilen
          metinler standart bir font (Helvetica) ile PDF üzerine işlenecektir. Görsel farklılıklar
          oluşabilir.
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="file-info">
            <div class="file-icon">PDF</div>
            <div>
              <div class="file-name">{{ store.file()!.name }}</div>
              <div class="file-meta">{{ store.totalPages() }} sayfa</div>
            </div>
          </div>

          <div class="toolbar-actions">
            <!-- Nav controls -->
            <div class="nav-ctrl">
              <button
                class="nav-btn"
                (click)="store.prevPage()"
                [disabled]="store.currentPage() === 1"
                title="Önceki Sayfa"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span class="nav-val">{{ store.currentPage() }} / {{ store.totalPages() }}</span>
              <button
                class="nav-btn"
                (click)="store.nextPage()"
                [disabled]="store.currentPage() === store.totalPages()"
                title="Sonraki Sayfa"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <button class="btn-ghost danger" (click)="store.clearFile()">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Yeni Dosya
            </button>
          </div>
        </div>

        <div class="editor-canvas-wrapper">
          <div class="canvas-container" [style.width]="store.viewportWidth() + 'px'">
            @if (store.renderUrl()) {
              <img
                [src]="store.renderUrl()"
                alt="PDF Preview"
                class="bg-img"
                [style.width.px]="store.viewportWidth()"
              />

              <div class="text-layer">
                @for (item of store.textItems(); track item.id) {
                  <div
                    class="text-box"
                    [class.editing]="editingId === item.id"
                    [class.edited]="isEdited(item)"
                    [style.left]="item.x + 'px'"
                    [style.top]="item.y + 'px'"
                    [style.width]="item.width + 'px'"
                    [style.height]="item.height + 'px'"
                    [style.font-size]="item.fontSize + 'px'"
                    [style.font-family]="item.fontFamily"
                    [style.line-height]="item.height + 'px'"
                    (click)="startEdit(item)"
                    (keydown.enter)="startEdit(item)"
                    tabindex="0"
                    role="button"
                  >
                    @if (editingId === item.id) {
                      <!-- The input expands slightly above its container to avoid clipping descenders -->
                      <input
                        #editInput
                        type="text"
                        class="text-input"
                        [value]="getDisplayText(item)"
                        (click)="$event.stopPropagation()"
                        (keydown.enter)="$event.preventDefault(); editInput.blur()"
                        (blur)="finishEdit(item, editInput.value)"
                        (keydown.escape)="cancelEdit()"
                      />
                    } @else {
                      @if (isEdited(item)) {
                        <span class="edited-text-span">{{ getDisplayText(item) }}</span>
                        <button
                          class="revert-btn"
                          (click)="$event.stopPropagation(); store.discardEdit(item.id)"
                          title="Değişikliği Geri Al"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      } @else {
                        <span [style.color]="'transparent'">{{ getDisplayText(item) }}</span>
                      }
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Save action -->
        @if (store.hasEdits()) {
          <div class="footer-row animate-slide-up">
            <button class="btn-accent" [disabled]="store.isProcessing()" (click)="store.save()">
              @if (store.isProcessing()) {
                <svg
                  class="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                PDF Kaydediliyor...
              } @else {
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v5h8" />
                </svg>
                Düzenlenen PDF'i Kaydet
                <span
                  class="pill"
                  style="margin-left:8px;background:rgba(255,255,255,0.2);color:#fff;border-color:transparent;"
                >
                  {{ store.pageEdits().length }} değişiklik
                </span>
              }
            </button>
          </div>
        }
      }

      @if (store.isProcessing() && !store.renderUrl()) {
        <app-progress-overlay [progress]="0" message="Sayfa okunuyor..." />
      }
    </div>
  `,
})
export class EditorComponent {
  store = inject(EditorStore);
  editingId: string | null = null;

  async onFileSelected(files: File[]) {
    if (files[0]) await this.store.setFile(files[0]);
  }

  isEdited(item: TextItem): boolean {
    return this.store.pageEdits().some((e) => e.originalTextItem.id === item.id);
  }

  getDisplayText(item: TextItem): string {
    const edit = this.store.pageEdits().find((e) => e.originalTextItem.id === item.id);
    return edit ? edit.newText : item.text;
  }

  startEdit(item: TextItem) {
    this.editingId = item.id;
    // Tiny delay to auto-focus the input once created
    setTimeout(() => {
      const inputs = document.querySelectorAll('.text-input');
      if (inputs.length > 0) (inputs[0] as HTMLElement).focus();
    }, 10);
  }

  cancelEdit() {
    this.editingId = null;
  }

  finishEdit(item: TextItem, newText: string) {
    if (this.editingId === item.id) {
      if (newText.trim() === '') {
        // If left entirely empty, that might mean delete text.
        // We can just add an empty string edit.
        this.store.addEdit(item, ' ');
      } else {
        this.store.addEdit(item, newText);
      }
      this.editingId = null;
    }
  }
}
