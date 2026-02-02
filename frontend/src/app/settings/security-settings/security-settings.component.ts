import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, SecuritySettings } from '../../shared/services/user.service';

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
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
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
    this.isLoading = true;
    this.userService.getSecuritySettings().subscribe({
      next: (response) => {
        if (response.success) {
          const settings = response.data;
          this.securityForm.patchValue({
            sessionTimeout: settings.sessionTimeout,
            passwordExpiry: settings.passwordExpiry,
            maxLoginAttempts: settings.maxLoginAttempts,
            requireStrongPassword: settings.requireStrongPassword,
            enableTwoFactor: settings.enableTwoFactor,
            enableAuditLog: settings.enableAuditLog
          });
          
          this.accessForm.patchValue({
            allowedIPs: settings.allowedIPs?.join(', ') || '',
            restrictByLocation: settings.restrictByLocation,
            enableSSO: settings.enableSSO,
            requireApproval: settings.requireApproval
          });
        }
      },
      error: (error) => {
        console.error('Error loading security settings:', error);
        this.errorMessage = 'Failed to load security settings';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSaveSecurity() {
    if (this.securityForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      
      this.userService.updateSecuritySettings(this.securityForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Security settings updated successfully';
            setTimeout(() => this.successMessage = '', 3000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to update security settings';
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  onSaveAccess() {
    if (this.accessForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      
      const formData = this.accessForm.value;
      const accessData = {
        ...formData,
        allowedIPs: formData.allowedIPs ? formData.allowedIPs.split(',').map((ip: string) => ip.trim()).filter((ip: string) => ip) : []
      };
      
      this.userService.updateSecuritySettings(accessData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Access settings updated successfully';
            setTimeout(() => this.successMessage = '', 3000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to update access settings';
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }
}
