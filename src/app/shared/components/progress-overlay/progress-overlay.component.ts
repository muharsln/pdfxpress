import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-[var(--color-surface)] rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <div class="relative w-24 h-24">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <path
              class="fill-none stroke-[var(--color-surface-subtle)]"
              stroke-width="3"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="fill-none stroke-[var(--color-primary)]"
              stroke-width="3"
              stroke-linecap="round"
              [attr.stroke-dasharray]="progress() + ', 100'"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-[var(--color-on-surface)]">{{ progress() }}%</span>
        </div>
        
        <p class="text-[var(--color-on-surface-muted)]">{{ message() }}</p>
        
        <button 
          class="px-6 py-2 bg-[var(--color-surface-subtle)] text-[var(--color-on-surface)] rounded-lg font-medium hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)] transition-colors"
          (click)="cancel.emit()"
        >
          İptal
        </button>
      </div>
    </div>
  `
})
export class ProgressOverlayComponent {
  progress = input(0);
  message = input('Processing...');
  cancel = output();
}
