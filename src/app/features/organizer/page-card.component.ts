import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="page-card"
      [class.selected]="selected()"
      [style.transform]="'rotate(' + rotation() + 'deg)'"
    >
      <!-- Top header with checkbox and delete button -->
      <div class="card-header">
        <label class="checkbox-container">
          <input type="checkbox" [checked]="selected()" (change)="toggleSelect.emit()" />
          <div class="checkmark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="page-num">Sayfa {{ pageNumber() }}</span>
        </label>

        <button class="delete-btn" (click)="delete.emit()" title="Sayfayı Sil">
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
        </button>
      </div>

      <!-- Preview area -->
      <div class="preview-area">
        @if (thumbnailUrl()) {
          <img [src]="thumbnailUrl()" alt="Page {{ pageNumber() }}" />
        } @else {
          <div class="loading-state">
            @if (loading()) {
              <div class="spinner"></div>
            } @else {
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
            }
          </div>
        }

        <!-- Hover overlay -->
        <div class="overlay"></div>
      </div>

      @if (rotation() !== 0) {
        <div class="rotation-badge">{{ rotation() }}°</div>
      }
    </div>
  `,
  styles: [
    `
      .page-card {
        background: var(--surface);
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 2px solid var(--border);
        transition: all 0.2s var(--ease);
        position: relative;
        user-select: none;
        box-shadow: var(--shadow-sm);
      }
      .page-card:hover {
        border-color: var(--border-2);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      .page-card.selected {
        border-color: var(--accent);
        background: var(--accent-subtle);
        box-shadow: 0 0 0 3px var(--accent-border);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: var(--surface-2);
        border-bottom: 1px solid var(--border);
        transition: background 0.2s;
      }
      .page-card.selected .card-header {
        background: var(--accent);
        border-color: var(--accent);
      }

      .checkbox-container {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .checkbox-container input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      .checkmark {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid var(--border-2);
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s var(--ease);
      }
      .checkmark svg {
        width: 12px;
        height: 12px;
        stroke: #fff;
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .checkbox-container:hover .checkmark {
        border-color: var(--accent);
      }
      .checkbox-container input:checked ~ .checkmark {
        background: var(--accent);
        border-color: var(--accent);
      }
      .checkbox-container input:checked ~ .checkmark svg {
        opacity: 1;
        transform: scale(1);
      }
      .page-card.selected .checkmark {
        background: #fff;
        border-color: #fff;
      }
      .page-card.selected .checkmark svg {
        stroke: var(--accent);
        opacity: 1;
        transform: scale(1);
      }

      .page-num {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-2);
        transition: color 0.2s;
      }
      .page-card.selected .page-num {
        color: #fff;
      }

      .delete-btn {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-3);
        opacity: 0;
        transition: all 0.2s;
      }
      .page-card:hover .delete-btn {
        opacity: 1;
      }
      .delete-btn:hover {
        background: var(--red-subtle);
        color: var(--red);
      }
      .page-card.selected .delete-btn {
        color: rgba(255, 255, 255, 0.7);
        opacity: 1;
      }
      .page-card.selected .delete-btn:hover {
        background: rgba(0, 0, 0, 0.15);
        color: #fff;
      }

      .preview-area {
        aspect-ratio: 1 / 1.35;
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .preview-area img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 4px;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.02);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      .page-card:hover .overlay {
        opacity: 1;
      }

      .rotation-badge {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 2px 6px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        border-radius: 4px;
        backdrop-filter: blur(4px);
      }

      .loading-state {
        color: var(--text-3);
      }
      .spinner {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--border);
        border-top-color: var(--accent);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class PageCardComponent {
  pageNumber = input.required<number>();
  thumbnailUrl = input<string | null>(null);
  selected = input(false);
  loading = input(false);
  rotation = input<number>(0);

  toggleSelect = output<void>();
  delete = output<void>();
}
