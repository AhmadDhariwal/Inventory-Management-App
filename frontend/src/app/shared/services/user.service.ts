import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogsService } from './activity-logs.service';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface RoleUpdateRequest {
  userId: string;
  newRole: 'admin' | 'manager' | 'user';
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordExpiry: number;
  maxLoginAttempts: number;
  requireStrongPassword: boolean;
  enableTwoFactor: boolean;
  enableAuditLog: boolean;
  allowedIPs: string[];
  restrictByLocation: boolean;
  enableSSO: boolean;
  requireApproval: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  lowStockAlerts: boolean;
  orderUpdates: boolean;
  systemMaintenance: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export interface InventorySettings {
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  enableLowStockAlert: boolean;
  autoUpdateStock: boolean;
  requireApprovalForRemoval: boolean;
  autoReceivePurchase: boolean;
  autoDeductSales: boolean;
  enableBarcodeScanning: boolean;
  trackSerialNumbers: boolean;
  trackBatchNumbers: boolean;
}

export interface BusinessSettings {
  companyName: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  fiscalYearStart: string;
  workingDays: string;
  enableMultiLocation: boolean;
  enableTaxCalculation: boolean;
  enableDiscounts: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000/user';
  private settingsUrl = 'http://localhost:3000/api/settings';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

  getUserProfile(): Observable<{success: boolean, data: UserProfile}> {
    return this.http.get<{success: boolean, data: UserProfile}>(`${this.baseUrl}/profile`);
  }

  updateUserProfile(profileData: {name: string, phone?: string, department?: string}): Observable<{success: boolean, message: string, data: UserProfile}> {
    return this.http.put<{success: boolean, message: string, data: UserProfile}>(`${this.baseUrl}/profile`, profileData).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'User Management',
            entityName: 'User Profile',
            description: 'Updated user profile information'
          }).subscribe();
        }
      })
    );
  }

  changePassword(passwordData: PasswordChangeRequest): Observable<{success: boolean, message: string}> {
    return this.http.put<{success: boolean, message: string}>(`${this.baseUrl}/change-password`, passwordData).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'User Management',
            entityName: 'Password',
            description: 'Changed user password'
          }).subscribe();
        }
      })
    );
  }

  getActiveSessions(): Observable<{success: boolean, data: any[]}> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.baseUrl}/sessions`);
  }

  terminateSession(sessionId: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  terminateAllSessions(): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/sessions/all`);
  }

  // Security Settings
  getSecuritySettings(): Observable<{success: boolean, data: SecuritySettings}> {
    return this.http.get<{success: boolean, data: SecuritySettings}>(`${this.settingsUrl}/security`);
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<{success: boolean, message: string, data: SecuritySettings}> {
    return this.http.put<{success: boolean, message: string, data: SecuritySettings}>(`${this.settingsUrl}/security`, settings).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Settings',
            entityName: 'Security Settings',
            description: 'Updated security settings'
          }).subscribe();
        }
      })
    );
  }

  // Notification Settings
  getNotificationSettings(): Observable<{success: boolean, data: NotificationSettings}> {
    return this.http.get<{success: boolean, data: NotificationSettings}>(`${this.settingsUrl}/notifications`);
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<{success: boolean, message: string, data: NotificationSettings}> {
    return this.http.put<{success: boolean, message: string, data: NotificationSettings}>(`${this.settingsUrl}/notifications`, settings).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Settings',
            entityName: 'Notification Settings',
            description: 'Updated notification settings'
          }).subscribe();
        }
      })
    );
  }

  // Inventory Settings
  getInventorySettings(): Observable<{success: boolean, data: InventorySettings}> {
    return this.http.get<{success: boolean, data: InventorySettings}>(`${this.settingsUrl}/inventory`);
  }

  updateInventorySettings(settings: Partial<InventorySettings>): Observable<{success: boolean, message: string, data: InventorySettings}> {
    return this.http.put<{success: boolean, message: string, data: InventorySettings}>(`${this.settingsUrl}/inventory`, settings).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Settings',
            entityName: 'Inventory Settings',
            description: 'Updated inventory settings'
          }).subscribe();
        }
      })
    );
  }

  // Business Settings
  getBusinessSettings(): Observable<{success: boolean, data: BusinessSettings}> {
    return this.http.get<{success: boolean, data: BusinessSettings}>(`${this.settingsUrl}/business`);
  }

  updateBusinessSettings(settings: Partial<BusinessSettings>): Observable<{success: boolean, message: string, data: BusinessSettings}> {
    return this.http.put<{success: boolean, message: string, data: BusinessSettings}>(`${this.settingsUrl}/business`, settings).pipe(
      tap((result) => {
        if (result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Settings',
            entityName: 'Business Settings',
            description: 'Updated business settings'
          }).subscribe();
        }
      })
    );
  }

  // User Management (Admin only)
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/all`);
  }

  updateUserRole(roleData: RoleUpdateRequest): Observable<{success: boolean, message: string, data: UserProfile}> {
    return this.http.put<{success: boolean, message: string, data: UserProfile}>(`${this.baseUrl}/role`, roleData);
  }

  toggleUserStatus(userId: string): Observable<{success: boolean, message: string, data: UserProfile}> {
    return this.http.put<{success: boolean, message: string, data: UserProfile}>(`${this.baseUrl}/${userId}/toggle-status`, {});
  }

  deleteUser(userId: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/${userId}`);
  }
}
