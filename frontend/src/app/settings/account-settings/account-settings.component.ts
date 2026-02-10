import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { UserService, UserProfile, PasswordChangeRequest } from '../../shared/services/user.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isPasswordLoading = false;
  twoFactorEnabled = false;
  activeSessions: any[] = [];
  user: UserProfile | null = null;
  updateSuccess = false;
  updateError = '';
  passwordSuccess = false;
  passwordError = '';
  showPasswordForm = false;
  sessionsLoading = false;
  twoFactorSecret = '';
  twoFactorQrUrl = '';
  twoFactorVerifyCode = '';
  twoFactorStep: 'OFF' | 'SETUP' | 'ON' = 'OFF';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initializeForms();
    this.loadActiveSessions();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.data;
          this.initializeForms();
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        const userData = localStorage.getItem('user');
        if (userData) {
          this.user = JSON.parse(userData);
          this.initializeForms();
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  initializeForms(): void {
    if (!this.user) return;
    
    this.twoFactorEnabled = !!this.user.twoFactorEnabled;
    this.twoFactorStep = this.twoFactorEnabled ? 'ON' : 'OFF';
    const nameParts = this.user.name ? this.user.name.split(' ') : ['', ''];
    
    this.profileForm = this.fb.group({
      firstName: [nameParts[0] || '', [Validators.required, Validators.minLength(2)]],
      lastName: [nameParts[1] || '', [Validators.required, Validators.minLength(2)]],
      email: [{value: this.user.email || '', disabled: true}, [Validators.required, Validators.email]],
      phone: [this.user.phone || ''],
      department: [this.user.department || ''],
      role: [{value: this.user.role || 'user', disabled: true}]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value === confirmPassword.value 
      ? null : { passwordMismatch: true };
  }

  loadActiveSessions(): void {
    this.sessionsLoading = true;
    this.userService.getActiveSessions().subscribe({
      next: (response) => {
        if (response.success) {
          this.activeSessions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
      },
      complete: () => {
        this.sessionsLoading = false;
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.cancelEdit();
    } else {
      this.isEditMode = true;
      this.updateSuccess = false;
      this.updateError = '';
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.updateSuccess = false;
    this.updateError = '';
    this.initializeForms();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.updateError = '';
      
      const formData = this.profileForm.value;
      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone || '',
        department: formData.department || ''
      };

      this.userService.updateUserProfile(updatedData).subscribe({
        next: (response) => {
          if (response.success) {
            this.user = response.data;
            this.updateSuccess = true;
            this.isEditMode = false;
            localStorage.setItem('user', JSON.stringify(this.user));
            setTimeout(() => this.updateSuccess = false, 3000);
          }
        },
        error: (error) => {
          this.updateError = error.error?.error || 'Failed to update profile';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordSuccess = false;
    this.passwordError = '';
    if (this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isPasswordLoading = true;
      this.passwordError = '';
      
      const passwordData: PasswordChangeRequest = this.passwordForm.value;
      
      this.userService.changePassword(passwordData).subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordSuccess = true;
            this.showPasswordForm = false;
            this.passwordForm.reset();
            setTimeout(() => this.passwordSuccess = false, 3000);
          }
        },
        error: (error) => {
          this.passwordError = error.error?.error || 'Failed to change password';
        },
        complete: () => {
          this.isPasswordLoading = false;
        }
      });
    }
  }

  terminateSession(sessionId: string): void {
    this.userService.terminateSession(sessionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadActiveSessions();
        }
      },
      error: (error) => {
        console.error('Error terminating session:', error);
      }
    });
  }

  terminateAllSessions(): void {
    if (confirm('This will sign you out from all devices. Continue?')) {
      this.userService.terminateAllSessions().subscribe({
        next: (response) => {
          if (response.success) {
            this.authService.logout();
          }
        },
        error: (error) => {
          console.error('Error terminating sessions:', error);
        }
      });
    }
  }

  getPasswordLastChanged(): string {
    if (!this.user?.passwordLastChanged) return 'Never';
    
    const date = new Date(this.user.passwordLastChanged);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  toggleTwoFactor(): void {
    this.isLoading = true;
    this.userService.toggleTwoFactor().subscribe({
      next: (response) => {
        if (response.success) {
          const enabled = response.data.twoFactorEnabled;
          if (response.data.isSetup) {
            this.twoFactorStep = 'SETUP';
            this.twoFactorSecret = response.data.secret || '';
            if (response.data.otpauthUrl) {
              // Use a more reliable and modern QR code service
              this.twoFactorQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.data.otpauthUrl)}`;
            }
          } else {
            this.twoFactorEnabled = false;
            this.twoFactorStep = 'OFF';
            this.twoFactorSecret = '';
            this.twoFactorQrUrl = '';
            if (this.user) {
              this.user.twoFactorEnabled = false;
              localStorage.setItem('user', JSON.stringify(this.user));
            }
          }
        }
      },
      error: (error) => {
        console.error('Error toggling 2FA:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  confirm2FA(): void {
    if (!this.twoFactorVerifyCode || this.twoFactorVerifyCode.length !== 6) return;
    
    this.isLoading = true;
    this.authService.verify2FA(this.user?._id || '', this.twoFactorVerifyCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.twoFactorEnabled = true;
          this.twoFactorStep = 'ON';
          this.twoFactorSecret = '';
          this.twoFactorQrUrl = '';
          if (this.user) {
            this.user.twoFactorEnabled = true;
            localStorage.setItem('user', JSON.stringify(this.user));
          }
        }
      },
      error: (error) => {
        alert(error.error?.error || 'Invalid verification code');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  exportData(): void {
    if (!this.user) return;
    
    const dataStr = JSON.stringify(this.user, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'account-data.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  logout(): void {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
    }
  }
}

