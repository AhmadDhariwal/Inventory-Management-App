export interface BusinessSettings {
  _id?: string;
  organizationId: string;
  
  // Organization Information
  organizationName: string;
  industry: 'retail' | 'manufacturing' | 'wholesale' | 'services' | 'technology' | 'healthcare' | 'it' | 'education' | 'other';
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  
  // Regional Settings
  currency: 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR' | 'CAD' | 'AUD' | 'AED' | 'SAR';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY';
  language: 'en' | 'es' | 'fr' | 'de' | 'ur' | 'hi' | 'ar';
  
  // Business Preferences
  fiscalYearStart: '01' | '04' | '07' | '10';
  fiscalYearEnd: '12' | '03' | '06' | '09';
  workingDays: 'monday-friday' | 'monday-saturday' | 'sunday-thursday' | 'custom';
  defaultTaxRate: number;
  autoSkuPrefix: string;
  
  // System Settings
  maintenanceMode: boolean;
  enableMultiLocation: boolean;
  enableTaxCalculation: boolean;
  enableDiscounts: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
  systemLogo?: string;
  emailSignature?: string;
  
  // Security Settings
  securitySettings?: {
    twoFactorEnforced: boolean;
    passwordExpiryDays: number;
    sessionTimeout: number;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessSettingsResponse {
  success: boolean;
  data: BusinessSettings;
  message: string;
}