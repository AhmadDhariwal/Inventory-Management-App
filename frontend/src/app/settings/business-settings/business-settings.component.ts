import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService, BusinessSettings } from '../../shared/services/user.service';

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
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadSettings();
  }

  initializeForms(): void {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]],
      industry: ['other'],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]]
    });

    this.regionalForm = this.fb.group({
      currency: ['USD', [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      dateFormat: ['MM/DD/YYYY'],
      language: ['en']
    });

    this.preferencesForm = this.fb.group({
      fiscalYearStart: ['01'],
      workingDays: ['monday-friday'],
      enableMultiLocation: [false],
      enableTaxCalculation: [true],
      enableDiscounts: [true]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.userService.getBusinessSettings().subscribe({
      next: (response) => {
        if (response.success) {
          const settings = response.data;
          
          this.companyForm.patchValue({
            companyName: settings.companyName,
            industry: settings.industry,
            address: settings.address,
            phone: settings.phone,
            email: settings.email
          });
          
          this.regionalForm.patchValue({
            currency: settings.currency,
            timezone: settings.timezone,
            dateFormat: settings.dateFormat,
            language: settings.language
          });
          
          this.preferencesForm.patchValue({
            fiscalYearStart: settings.fiscalYearStart,
            workingDays: settings.workingDays,
            enableMultiLocation: settings.enableMultiLocation,
            enableTaxCalculation: settings.enableTaxCalculation,
            enableDiscounts: settings.enableDiscounts
          });
        }
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

  private saveSettings(data: any, type: string): void {
    this.isSaving = true;
    this.errorMessage = '';
    
    this.userService.updateBusinessSettings(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `${type} updated successfully`;
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || `Failed to update ${type.toLowerCase()}`;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}
