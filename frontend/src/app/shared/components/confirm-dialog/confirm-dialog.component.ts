import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="close-btn" (click)="onCancel()" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="icon-container" [ngClass]="type">
            <svg *ngIf="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
            </svg>
            <svg *ngIf="type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <p class="message">{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn" [ngClass]="type === 'warning' ? 'btn-danger' : 'btn-primary'" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #a0aec0;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        color: #4a5568;
        background: #f7fafc;
      }
    }

    .modal-body {
      padding: 1.5rem;
      text-align: center;
    }

    .icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;

      &.warning {
        background: #fed7d7;
        color: #e53e3e;
      }

      &.info {
        background: #bee3f8;
        color: #3182ce;
      }
    }

    .message {
      color: #4a5568;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      padding: 0 1.5rem 1.5rem 1.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &.btn-primary {
        background: #4299e1;
        color: white;

        &:hover {
          background: #3182ce;
        }
      }

      &.btn-danger {
        background: #e53e3e;
        color: white;

        &:hover {
          background: #c53030;
        }
      }

      &.btn-outline {
        background: white;
        color: #4a5568;
        border: 2px solid #e2e8f0;

        &:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }
      }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'warning' | 'info' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}