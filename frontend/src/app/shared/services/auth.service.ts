import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ActivityLogsService } from './activity-logs.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  phone: string;
  department: string;
  password: string;
  role?: string;
  organizationName?: string; // For auto-creating organization on first signup
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  role?: string;
  requires2FA?: boolean;
  userId?: string;
  item?: any;
  data?: {
    _id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    organizationId: string;
    department?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  organizationId?: string;
  managerId?: string;
  department?: string;
  twoFactorEnabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private roleKey = 'user_role';
  private organizationKey = 'organization_id';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private activityService: ActivityLogsService
  ) {
    this.checkTokenValidity();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.setAuthData(response);
          // Log login activity
          this.activityService.logLogin().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  verify2FA(userId: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/verify-2fa`, { userId, code })
      .pipe(
        tap((response: AuthResponse) => {
          this.setAuthData(response);
          // Log login activity
          this.activityService.logLogin().subscribe();
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          this.setAuthData(response);
        }),
        catchError(this.handleError)
      );
  }

  private setAuthData(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      if (response.role) {
        localStorage.setItem(this.roleKey, response.role);
      }
      
      // Handle both old (item) and new (data) response formats
      const userData = response.data || response.item;
      
      if (userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        
        // Store organizationId separately for easy access
        if (userData.organizationId) {
          localStorage.setItem(this.organizationKey, userData.organizationId);
        }
      }

      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(userData);
    }
  }

  logout(): void {
    // Log logout activity before clearing data
    if (this.isAuthenticated()) {
      this.activityService.logLogout().subscribe();
    }
    
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.organizationKey);

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getOrganizationId(): string | null {
    return localStorage.getItem(this.organizationKey);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }

      // Verify token has organizationId (for multi-tenant support)
      if (!payload.organizationId) {
        console.warn('Token missing organizationId - please re-login');
        // Don't force logout yet for backward compatibility
      }

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole ? userRole.toLowerCase() === role.toLowerCase() : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    const lowerUserRole = userRole.toLowerCase();
    return roles.some(r => r.toLowerCase() === lowerUserRole);
  }

  private checkTokenValidity(): void {
    if (!this.hasValidToken()) {
      this.logout();
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.error?.message || error.message;
    }

    return throwError(() => ({ error: errorMessage }));
  }
}
