import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }} slide-up">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              }
              @case ('error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v4M12 17h.01"/>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              }
              @case ('info') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              }
            }
          </div>
          
          <div class="toast-content">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>
          
          <button class="toast-close" (click)="removeToast(toast.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: var(--spacing-lg);
      right: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      z-index: var(--z-index-toast);
      max-width: 360px;
    }
    
    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      border-left: 4px solid;
    }
    
    .toast-success {
      border-color: var(--color-success);
    }
    
    .toast-error {
      border-color: var(--color-error);
    }
    
    .toast-warning {
      border-color: var(--color-warning);
    }
    
    .toast-info {
      border-color: var(--color-primary);
    }
    
    .toast-icon {
      flex-shrink: 0;
    }
    
    .toast-success .toast-icon {
      color: var(--color-success);
    }
    
    .toast-error .toast-icon {
      color: var(--color-error);
    }
    
    .toast-warning .toast-icon {
      color: var(--color-warning);
    }
    
    .toast-info .toast-icon {
      color: var(--color-primary);
    }
    
    .toast-content {
      flex: 1;
      min-width: 0;
    }
    
    .toast-title {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-md);
    }
    
    .toast-message {
      font-size: var(--font-size-sm);
      color: var(--color-on-surface-muted);
      margin-top: var(--spacing-xs);
    }
    
    .toast-close {
      flex-shrink: 0;
      color: var(--color-on-surface-muted);
      padding: var(--spacing-xs);
    }
    
    .toast-close:hover {
      color: var(--color-on-surface);
    }
  `]
})
export class ToastNotificationComponent {
  toasts = signal<Toast[]>([]);
  
  show(type: Toast['type'], title: string, message?: string, duration = 4000) {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, title, message };
    
    this.toasts.update(t => [...t, toast]);
    
    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }
  
  removeToast(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
  
  success(title: string, message?: string) {
    this.show('success', title, message);
  }
  
  error(title: string, message?: string) {
    this.show('error', title, message);
  }
  
  info(title: string, message?: string) {
    this.show('info', title, message);
  }
  
  warning(title: string, message?: string) {
    this.show('warning', title, message);
  }
}
