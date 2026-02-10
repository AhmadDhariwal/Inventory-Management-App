import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BusinessSettings, BusinessSettingsResponse } from '../models/business-settings.model';
import { ActivityLogsService } from './activity-logs.service';
import { SocketService } from './socket.service';

@Injectable({ 
  providedIn: 'root' 
})
export class BusinessSettingsService {
  private baseUrl = 'http://localhost:3000/api/business-settings';
  private settingsSubject = new BehaviorSubject<BusinessSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService,
    private socketService: SocketService
  ) {
    this.initSocketListener();
  }

  private initSocketListener(): void {
    this.socketService.listen<BusinessSettings>('SETTINGS_UPDATED').subscribe((settings: BusinessSettings) => {
      console.log('Business settings updated in real-time:', settings);
      this.settingsSubject.next(settings);
    });
  }

  // Get all business settings
  getSettings(): Observable<BusinessSettings> {
    return this.http.get<BusinessSettingsResponse>(this.baseUrl).pipe(
      map(response => response.data),
      tap(settings => this.settingsSubject.next(settings))
    );
  }

  // Update business settings
  updateSettings(data: Partial<BusinessSettings>): Observable<BusinessSettings> {
    return this.http.put<BusinessSettingsResponse>(this.baseUrl, data).pipe(
      map(response => response.data),
      tap(settings => {
        this.settingsSubject.next(settings);
        this.activityService.createLog({
          action: 'UPDATE',
          module: 'Business Settings',
          entityName: 'Company Settings',
          description: `Updated business settings: ${Object.keys(data).join(', ')}`
        }).subscribe();
      })
    );
  }

  // Get company information only
  getCompanyInfo(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.baseUrl}/company`).pipe(
      map(response => response.data)
    );
  }

  // Get regional settings only
  getRegionalSettings(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.baseUrl}/regional`).pipe(
      map(response => response.data)
    );
  }

  // Get business preferences only
  getBusinessPreferences(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.baseUrl}/preferences`).pipe(
      map(response => response.data)
    );
  }

  // Get current settings from cache
  getCurrentSettings(): BusinessSettings | null {
    return this.settingsSubject.value;
  }

  // Get currency symbol
  getCurrencySymbol(): string {
    const settings = this.getCurrentSettings();
    if (!settings) return '$';
    
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'PKR': '₨',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$',
      'AED': 'د.إ',
      'SAR': '﷼'
    };
    
    return symbols[settings.currency] || '$';
  }

  // Format date according to settings
  formatDate(date: Date | string): string {
    const settings = this.getCurrentSettings();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!settings) return dateObj.toLocaleDateString();
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB', options);
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'DD.MM.YYYY':
        return dateObj.toLocaleDateString('de-DE', options);
      default:
        return dateObj.toLocaleDateString('en-US', options);
    }
  }
}
