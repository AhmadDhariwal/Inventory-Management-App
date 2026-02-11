import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification, PaginatedNotifications } from '../../shared/services/notification.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-notification-activity',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './notification-activity.component.html',
  styleUrl: './notification-activity.component.scss'
})
export class NotificationActivityComponent implements OnInit {
  notifications: AppNotification[] = [];
  pagination: any = {};
  currentPage = 1;
  isLoading = false;
  
  notificationToDelete: string | null = null;
  showConfirmDelete = false;
  protected readonly Math = Math;

  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(page: number = 1) {
    this.isLoading = true;
    this.notificationService.getNotifications(page, 15).subscribe({
      next: (response: PaginatedNotifications) => {
        this.notifications = response.notifications;
        this.pagination = response.pagination;
        this.currentPage = page;
      },
      error: (err: any) => console.error('Error loading notifications:', err),
      complete: () => this.isLoading = false
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.loadNotifications(page);
    }
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications(this.currentPage);
    });
  }

  confirmDelete(id: string) {
    this.notificationToDelete = id;
    this.showConfirmDelete = true;
  }

  onDeleteConfirmed() {
    if (this.notificationToDelete) {
      this.notificationService.deleteNotification(this.notificationToDelete).subscribe(() => {
        this.loadNotifications(this.currentPage);
        this.showConfirmDelete = false;
        this.notificationToDelete = null;
      });
    }
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll().subscribe(() => {
        this.loadNotifications(1);
      });
    }
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      'LOW_STOCK': 'fa-exclamation-triangle',
      'PURCHASE_APPROVAL': 'fa-file-invoice-dollar',
      'STOCK_MOVEMENT': 'fa-exchange-alt',
      'ORDER_STATUS': 'fa-shopping-cart',
      'SYSTEM': 'fa-cog',
      'INFO': 'fa-info-circle',
      'SUCCESS': 'fa-check-circle',
      'WARNING': 'fa-exclamation-circle'
    };
    return icons[type] || 'fa-bell';
  }

  getTypeClass(type: string): string {
    const classes: any = {
      'LOW_STOCK': 'type-error',
      'PURCHASE_APPROVAL': 'type-info',
      'STOCK_MOVEMENT': 'type-success',
      'ORDER_STATUS': 'type-info',
      'SYSTEM': 'type-warning'
    };
    return classes[type] || '';
  }
}
