import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, NotificationSettings } from '../../shared/services/user.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss'
})
export class NotificationSettingsComponent implements OnInit {
  notificationForm: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      lowStockAlerts: [true],
      purchaseApprovals: [true],
      stockMovement: [true],
      orderUpdates: [true],
      systemMaintenance: [true],
      weeklyReports: [false],
      monthlyReports: [true]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.userService.getNotificationSettings().subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationForm.patchValue(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
        this.errorMessage = 'Failed to load notification settings';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSave() {
    this.isSaving = true;
    this.errorMessage = '';
    
    this.userService.updateNotificationSettings(this.notificationForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Notification settings updated successfully';
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update notification settings';
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
