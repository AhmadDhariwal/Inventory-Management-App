import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BusinessSettingsService } from '../../shared/services/business-settings.service';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-settings.component.html',
  styleUrl: './business-settings.component.scss'
})
export class BusinessSettingsComponent implements OnInit {
  companyForm!: FormGroup;
  regionalForm!: FormGroup;
  preferencesForm!: FormGroup;
  systemForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  industries = ['retail', 'manufacturing', 'wholesale', 'services', 'technology', 'healthcare', 'it', 'education', 'other'];
  currencies = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'CAD', 'AUD', 'AED', 'SAR'];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ur', name: 'Urdu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' }
  ];
  dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'];

  constructor(
    private fb: FormBuilder,
    private businessSettingsService: BusinessSettingsService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadSettings();
  }

  initializeForms(): void {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]],
      industry: ['other'],
      taxId: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: ['']
    });

    this.regionalForm = this.fb.group({
      currency: ['USD', [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      dateFormat: ['MM/DD/YYYY'],
      language: ['en']
    });

    this.preferencesForm = this.fb.group({
      fiscalYearStart: ['01'],
      fiscalYearEnd: ['12'],
      workingDays: ['monday-friday'],
      defaultTaxRate: [0, [Validators.min(0)]],
      autoSkuPrefix: ['SKU-'],
      enableMultiLocation: [false],
      enableTaxCalculation: [true],
      enableDiscounts: [true]
    });

    this.systemForm = this.fb.group({
      maintenanceMode: [false],
      defaultTheme: ['light'],
      systemLogo: [''],
      emailSignature: ['']
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.businessSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.companyForm.patchValue({
          companyName: settings.companyName,
          industry: settings.industry,
          taxId: settings.taxId,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          website: settings.website
        });
        
        this.regionalForm.patchValue({
          currency: settings.currency,
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
          language: settings.language
        });
        
        this.preferencesForm.patchValue({
          fiscalYearStart: settings.fiscalYearStart,
          fiscalYearEnd: settings.fiscalYearEnd,
          workingDays: settings.workingDays,
          defaultTaxRate: settings.defaultTaxRate,
          autoSkuPrefix: settings.autoSkuPrefix,
          enableMultiLocation: settings.enableMultiLocation,
          enableTaxCalculation: settings.enableTaxCalculation,
          enableDiscounts: settings.enableDiscounts
        });

        this.systemForm.patchValue({
          maintenanceMode: settings.maintenanceMode,
          defaultTheme: settings.defaultTheme,
          systemLogo: settings.systemLogo,
          emailSignature: settings.emailSignature
        });
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
        this.errorMessage = 'Failed to load business settings';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSaveCompany(): void {
    if (this.companyForm.valid) {
      this.saveSettings(this.companyForm.value, 'Company information');
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  onSaveRegional(): void {
    if (this.regionalForm.valid) {
      this.saveSettings(this.regionalForm.value, 'Regional settings');
    } else {
      this.regionalForm.markAllAsTouched();
    }
  }

  onSavePreferences(): void {
    if (this.preferencesForm.valid) {
      this.saveSettings(this.preferencesForm.value, 'Business preferences');
    } else {
      this.preferencesForm.markAllAsTouched();
    }
  }

  onSaveSystem(): void {
    if (this.systemForm.valid) {
      this.saveSettings(this.systemForm.value, 'System settings');
    } else {
      this.systemForm.markAllAsTouched();
    }
  }

  private saveSettings(data: any, type: string): void {
    this.isSaving = true;
    this.errorMessage = '';
    
    this.businessSettingsService.updateSettings(data).subscribe({
      next: (settings) => {
        this.successMessage = `${type} updated successfully`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || `Failed to update ${type.toLowerCase()}`;
        console.error(`Save error (${type}):`, error);
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
