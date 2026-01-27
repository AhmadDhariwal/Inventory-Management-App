import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {
  profileForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  twoFactorEnabled = false;
  activeSessions = 1;
  user: any = {};

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initializeForm();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  initializeForm(): void {
    const nameParts = this.user.name ? this.user.name.split(' ') : ['', ''];
    
    this.profileForm = this.fb.group({
      firstName: [nameParts[0] || '', [Validators.required, Validators.minLength(2)]],
      lastName: [nameParts[1] || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      phone: [this.user.phone || ''],
      department: [this.user.department || '']
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.cancelEdit();
    } else {
      this.isEditMode = true;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.initializeForm(); // Reset form to original values
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      const formData = this.profileForm.value;
      const updatedUser = {
        ...this.user,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        department: formData.department
      };

      // Simulate API call
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
        this.isLoading = false;
        this.isEditMode = false;
        
        // Show success message (you can replace with a proper notification service)
        alert('Profile updated successfully!');
      }, 1000);
    }
  }

  getPasswordLastChanged(): string {
    // This would typically come from the backend
    return '30 days ago';
  }

  changePassword(): void {
    // Implement password change functionality
    alert('Password change functionality would be implemented here');
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    alert(`Two-factor authentication ${this.twoFactorEnabled ? 'enabled' : 'disabled'}`);
  }

  viewSessions(): void {
    // Implement session management
    alert('Session management would be implemented here');
  }

  exportData(): void {
    // Implement data export
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

