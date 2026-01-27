import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss'
})
export class SecuritySettingsComponent implements OnInit {
  securityForm: FormGroup;
  accessForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.securityForm = this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(5)]],
      passwordExpiry: [90, [Validators.required, Validators.min(30)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3)]],
      requireStrongPassword: [true],
      enableTwoFactor: [false],
      enableAuditLog: [true]
    });

    this.accessForm = this.fb.group({
      allowedIPs: [''],
      restrictByLocation: [false],
      enableSSO: [false],
      requireApproval: [false]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Load existing settings
  }

  onSaveSecurity() {
    if (this.securityForm.valid) {
      console.log('Security settings:', this.securityForm.value);
    }
  }

  onSaveAccess() {
    if (this.accessForm.valid) {
      console.log('Access settings:', this.accessForm.value);
    }
  }
}
