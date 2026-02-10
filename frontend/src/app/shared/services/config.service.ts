import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BusinessSettings } from '../models/business-settings.model';
import { BusinessSettingsService } from './business-settings.service';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private settingsSubject = new BehaviorSubject<BusinessSettings | null>(this.loadFromCache());
  public settings$ = this.settingsSubject.asObservable();
  private isLoaded = false;

  get currentSettings(): BusinessSettings | null {
    return this.settingsSubject.value;
  }

  constructor(
    private settingsService: BusinessSettingsService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router
  ) {
    this.refreshSettings();
    this.initListeners();
  }

  private initListeners() {
    this.socketService.listen<BusinessSettings>('SETTINGS_UPDATED').subscribe(settings => {
      this.settingsSubject.next(settings);
      this.applyGlobalChanges(settings);
    });
  }

  refreshSettings(force: boolean = false) {
    if (this.isLoaded && !force) return;
    
    this.settingsService.getSettings().subscribe(settings => {
      this.settingsSubject.next(settings);
      this.isLoaded = true;
      this.saveToCache(settings);
      this.applyGlobalChanges(settings);
    });
  }

  private saveToCache(settings: BusinessSettings) {
    try {
      localStorage.setItem('business_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to cache settings:', e);
    }
  }

  private loadFromCache(): BusinessSettings | null {
    try {
      const cached = localStorage.getItem('business_settings');
      if (cached) {
        const settings = JSON.parse(cached);
        this.applyGlobalChanges(settings);
        return settings;
      }
    } catch (e) {
      console.error('Failed to load settings from cache:', e);
    }
    return null;
  }

  private applyGlobalChanges(settings: BusinessSettings) {
    // 1. Maintainance Mode (handled via Guard/Interceptor, but can be checked here)
    if (settings.maintenanceMode) {
      console.warn('SYSTEM IN MAINTENANCE MODE');
    }

    // 2. Theming
    const body = document.getElementsByTagName('body')[0];
    if (settings.defaultTheme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }

    // 3. 2FA Enforcement
    if (settings.securitySettings?.twoFactorEnforced) {
      const user = this.authService.getCurrentUser();
      if (user && !user.twoFactorEnabled) {
        // Redir if not already on account settings
        const currentUrl = this.router.url;
        if (!currentUrl.includes('/settings/account') && !currentUrl.includes('/auth')) {
          console.warn('2FA is enforced by your organization. Redirecting to setup...');
          this.router.navigate(['/settings/account']);
        }
      }
    }
  }

  get currencySymbol(): string {
    const s = this.settingsSubject.value;
    if (!s) return '$';
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'PKR': 'Rs', 
      'INR': '₹', 'CAD': '$', 'AUD': '$', 'AED': 'د.إ', 'SAR': '﷼'
    };
    return symbols[s.currency] || '$';
  }

  get organizationName(): string {
    return this.settingsSubject.value?.organizationName || 'Inventory App';
  }
}
