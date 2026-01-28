import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusinessSettingsService } from '../../shared/services/business-settings.service';
import { BusinessSettings } from '../../shared/models/business-settings.model';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './business-settings.component.html',
  styleUrl: './business-settings.component.scss'
})
export class BusinessSettingsComponent implements OnInit {
  companyForm: FormGroup;
  regionalForm: FormGroup;
  preferencesForm: FormGroup;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private businessSettingsService: BusinessSettingsService
  ) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: ['other'],
      address: [''],
      phone: [''],
      email: ['', Validators.email]
    });

    this.regionalForm = this.fb.group({
      currency: ['USD', Validators.required],
      timezone: ['UTC', Validators.required],
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

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.businessSettingsService.getSettings().subscribe({
      next: (settings: BusinessSettings) => {
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
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading business settings:', error);
        this.isLoading = false;
      }
    });
  }

  onSaveCompany() {
    if (this.companyForm.valid) {
      this.isSaving = true;
      this.businessSettingsService.updateSettings(this.companyForm.value).subscribe({
        next: (settings: BusinessSettings) => {
          console.log('Company settings updated:', settings);
          alert('Company information updated successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating company settings:', error);
          alert('Error updating company information. Please try again.');
          this.isSaving = false;
        }
      });
    }
  }

  onSaveRegional() {
    if (this.regionalForm.valid) {
      this.isSaving = true;
      this.businessSettingsService.updateSettings(this.regionalForm.value).subscribe({
        next: (settings: BusinessSettings) => {
          console.log('Regional settings updated:', settings);
          alert('Regional settings updated successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating regional settings:', error);
          alert('Error updating regional settings. Please try again.');
          this.isSaving = false;
        }
      });
    }
  }

  onSavePreferences() {
    if (this.preferencesForm.valid) {
      this.isSaving = true;
      this.businessSettingsService.updateSettings(this.preferencesForm.value).subscribe({
        next: (settings: BusinessSettings) => {
          console.log('Preferences updated:', settings);
          alert('Business preferences updated successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating preferences:', error);
          alert('Error updating preferences. Please try again.');
          this.isSaving = false;
        }
      });
    }
  }
}