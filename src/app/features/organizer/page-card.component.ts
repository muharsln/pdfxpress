import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-[var(--color-surface-elevated)] rounded-lg overflow-hidden transition-all hover:shadow-lg border-2 border-transparent relative"
      [class.border-[var(--color-primary)]]="selected()"
      [style.rotation]="rotation() + 'deg'"
    >
      <div class="flex items-center gap-2 p-2 bg-[var(--color-surface-subtle)]">
        <input 
          type="checkbox" 
          class="w-4 h-4 accent-[var(--color-primary)]"
          [checked]="selected()"
          (change)="toggleSelect.emit()"
        />
        <span class="flex-1 text-sm font-medium">Sayfa {{ pageNumber() }}</span>
        <button class="p-1 text-[var(--color-on-surface-muted)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] rounded opacity-0 group-hover:opacity-100 transition-opacity" (click)="delete.emit()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="aspect-[8.5/11] bg-[var(--color-surface)] flex items-center justify-center group">
        @if (thumbnailUrl()) {
          <img [src]="thumbnailUrl()" alt="Page {{ pageNumber() }}" class="w-full h-full object-contain" />
        } @else {
          <div class="text-[var(--color-on-surface-muted)]">
            @if (loading()) {
              <div class="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            } @else {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            }
          </div>
        }
      </div>
      
      @if (rotation() !== 0) {
        <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs rounded">{{ rotation() }}°</div>
      }
    </div>
  `
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
