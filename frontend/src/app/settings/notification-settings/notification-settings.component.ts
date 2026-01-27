import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.scss'
})
export class NotificationSettingsComponent implements OnInit {
  notificationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      lowStockAlerts: [true],
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
    // Load existing settings
  }

  onSave() {
    console.log('Notification settings:', this.notificationForm.value);
  }
}
