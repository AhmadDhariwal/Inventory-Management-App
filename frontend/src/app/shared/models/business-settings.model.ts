export interface BusinessSettings {
  _id?: string;
  
  // Company Information
  companyName: string;
  industry: 'retail' | 'manufacturing' | 'wholesale' | 'services' | 'technology' | 'healthcare' | 'other';
  address?: string;
  phone?: string;
  email?: string;
  
  // Regional Settings
  currency: 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR' | 'CAD' | 'AUD';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY';
  language: 'en' | 'es' | 'fr' | 'de' | 'ur' | 'hi';
  
  // Business Preferences
  fiscalYearStart: '01' | '04' | '07' | '10';
  workingDays: 'monday-friday' | 'monday-saturday' | 'sunday-thursday' | 'custom';
  enableMultiLocation: boolean;
  enableTaxCalculation: boolean;
  enableDiscounts: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessSettingsResponse {
  success: boolean;
  data: BusinessSettings;
  message: string;
}