import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  role: string;
  item: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private roleKey = 'user_role';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && user && this.isTokenValid(token)) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
    } else {
      this.clearAuthData();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.setAuthData(response);
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
    if (response.token && response.item) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.roleKey, response.role);
      localStorage.setItem(this.userKey, JSON.stringify(response.item));

      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(response.item);
    }
  }

  logout(): void {
    console.log('Logout method called');
    this.clearAuthData();
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

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
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
