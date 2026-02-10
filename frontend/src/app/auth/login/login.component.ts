import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,FormControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  successMessage = '';
  showPassword = false;
  returnUrl = '/dashboard';
  requires2FA = false;
  userId = '';
  otpForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initializeForm();
    this.handleRouteParams();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }

      if (params['message']) {
        this.successMessage = params['message'];
        setTimeout(() => this.successMessage = '', 5000);
      }

      if (params['error']) {
        switch (params['error']) {
          case 'insufficient_permissions':
            this.error = 'You do not have permission to access that page.';
            break;
          case 'session_expired':
            this.error = 'Your session has expired. Please log in again.';
            break;
          default:
            this.error = 'Please log in to continue.';
        }
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.error = '';
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.requires2FA) {
          this.loading = false;
          this.requires2FA = true;
          this.userId = response.userId || '';
          this.initializeOTPForm();
          return;
        }
        this.loading = false;
        this.successMessage = 'Login successful! Redirecting...';

        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Invalid credentials. Please try again.';
      }
    });
  }

  onOTPSubmit(): void {
    if (this.otpForm.invalid) return;

    this.loading = true;
    const code = this.otpForm.value.code;

    this.authService.verify2FA(this.userId, code).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '2FA Verified! Redirecting...';
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Invalid OTP code. Please try again.';
      }
    });
  }

  private initializeOTPForm(): void {
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  // Social login methods (placeholder for future implementation)
  loginWithGoogle(): void {
    console.log('Google login - Feature coming soon');
  }

  loginWithGitHub(): void {
    console.log('GitHub login - Feature coming soon');
  }
}
