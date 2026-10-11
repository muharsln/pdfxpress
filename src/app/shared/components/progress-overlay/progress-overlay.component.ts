import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        class="flex flex-col items-center"
        style="background:var(--surface);border-radius:var(--r-xl);padding:var(--s-xl);gap:var(--s-md);box-shadow:var(--shadow-lg);border:1px solid var(--border);"
      >
        <div class="relative w-24 h-24">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <path
              class="fill-none"
              style="stroke:var(--surface-2);"
              stroke-width="3"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="fill-none"
              style="stroke:var(--accent);"
              stroke-width="3"
              stroke-linecap="round"
              [attr.stroke-dasharray]="progress() + ', 100'"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold"
            style="font-size:var(--fs-h3);color:var(--text);font-family:var(--mono);"
            >{{ progress() }}%</span
          >
        </div>

        <p style="color:var(--text-3);font-size:var(--fs-sm);">{{ message() }}</p>

        <button class="btn-ghost danger" (click)="canceled.emit()" style="margin-top:var(--s-sm);">
          İptal
        </button>
      </div>
    </div>
  `,
})
export class ProgressOverlayComponent {
  progress = input(0);
  message = input('Processing...');
  canceled = output();
}
