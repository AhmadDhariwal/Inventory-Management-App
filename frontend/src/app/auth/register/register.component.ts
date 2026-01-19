import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };
  
  loading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  
  // Individual field errors
  firstNameError = '';
  lastNameError = '';
  emailError = '';
  usernameError = '';
  passwordError = '';
  confirmPasswordError = '';
  termsError = '';
  
  passwordStrength = 0;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Validation methods
  validateFirstName(): void {
    if (!this.formData.firstName.trim()) {
      this.firstNameError = 'First name is required';
    } else if (this.formData.firstName.trim().length < 2) {
      this.firstNameError = 'First name must be at least 2 characters';
    } else {
      this.firstNameError = '';
    }
  }

  validateLastName(): void {
    if (!this.formData.lastName.trim()) {
      this.lastNameError = 'Last name is required';
    } else if (this.formData.lastName.trim().length < 2) {
      this.lastNameError = 'Last name must be at least 2 characters';
    } else {
      this.lastNameError = '';
    }
  }

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formData.email.trim()) {
      this.emailError = 'Email address is required';
    } else if (!emailRegex.test(this.formData.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  validateUsername(): void {
    if (!this.formData.username.trim()) {
      this.usernameError = 'Username is required';
    } else if (this.formData.username.length < 3) {
      this.usernameError = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.formData.username)) {
      this.usernameError = 'Username can only contain letters, numbers, and underscores';
    } else {
      this.usernameError = '';
    }
  }

  validatePassword(): void {
    if (!this.formData.password) {
      this.passwordError = 'Password is required';
    } else if (this.formData.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.formData.password)) {
      this.passwordError = 'Password must contain uppercase, lowercase, and number';
    } else {
      this.passwordError = '';
    }
  }

  validateConfirmPassword(): void {
    if (!this.formData.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    } else {
      this.confirmPasswordError = '';
    }
  }

  // Clear error methods
  clearFirstNameError(): void { this.firstNameError = ''; this.error = ''; }
  clearLastNameError(): void { this.lastNameError = ''; this.error = ''; }
  clearEmailError(): void { this.emailError = ''; this.error = ''; }
  clearUsernameError(): void { this.usernameError = ''; this.error = ''; }
  clearPasswordError(): void { this.passwordError = ''; this.error = ''; }
  clearConfirmPasswordError(): void { this.confirmPasswordError = ''; this.error = ''; }
  clearTermsError(): void { this.termsError = ''; this.error = ''; }

  // Password strength calculation
  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^\w\s]/.test(password)) strength++;
    return strength;
  }

  onPasswordInput(): void {
    this.clearPasswordError();
    this.passwordStrength = this.calculatePasswordStrength(this.formData.password);
    if (this.formData.confirmPassword) {
      this.validateConfirmPassword();
    }
  }

  getPasswordStrengthClass(): string {
    if (this.passwordStrength <= 2) return 'strength--weak';
    if (this.passwordStrength <= 3) return 'strength--medium';
    return 'strength--strong';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength <= 2) return 'Weak password';
    if (this.passwordStrength <= 3) return 'Medium strength';
    return 'Strong password';
  }

  isFormValid(): boolean {
    return this.formData.firstName.trim().length >= 2 &&
           this.formData.lastName.trim().length >= 2 &&
           this.formData.email.trim().length > 0 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email) &&
           this.formData.username.length >= 3 &&
           this.formData.password.length >= 8 &&
           this.formData.password === this.formData.confirmPassword &&
           this.acceptTerms === true &&
           !this.firstNameError &&
           !this.lastNameError &&
           !this.emailError &&
           !this.usernameError &&
           !this.passwordError &&
           !this.confirmPasswordError;
  }

  signUpWithGoogle(): void {
    console.log('Google signup clicked');
  }

  signUpWithGitHub(): void {
    console.log('GitHub signup clicked');
  }

  onSubmit(): void {
    this.error = '';
    
    // Validate all fields
    this.validateFirstName();
    this.validateLastName();
    this.validateEmail();
    this.validateUsername();
    this.validatePassword();
    this.validateConfirmPassword();
    
    if (!this.acceptTerms) {
      this.termsError = 'Please accept the terms and conditions';
    }

    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    
    // Simulate API call - replace with actual registration service
    setTimeout(() => {
      this.loading = false;
      // On success, redirect to login with success message
      this.router.navigate(['/auth/login'], { 
        queryParams: { message: 'Account created successfully! Please sign in to continue.' }
      });
    }, 2000);
  }
}
