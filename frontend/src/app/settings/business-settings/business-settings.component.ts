import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeCompanyForm();
    this.initializeRegionalForm();
    this.initializePreferencesForm();
  }

  initializeCompanyForm(): void {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]],
      industry: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]]
    });
  }

  initializeRegionalForm(): void {
    this.regionalForm = this.fb.group({
      currency: ['', [Validators.required]],
      timezone: ['', [Validators.required]],
      dateFormat: ['MM/DD/YYYY'],
      language: ['en']
    });
  }

  initializePreferencesForm(): void {
    this.preferencesForm = this.fb.group({
      fiscalYearStart: ['01'],
      workingDays: ['monday-friday'],
      enableMultiLocation: [false],
      enableTaxCalculation: [false],
      enableDiscounts: [false]
    });
  }

  onSaveCompany(): void {
    if (this.companyForm.valid) {
      console.log('Company Info:', this.companyForm.value);
      // API call here
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  onSaveRegional(): void {
    if (this.regionalForm.valid) {
      console.log('Regional Settings:', this.regionalForm.value);
      // API call here
    } else {
      this.regionalForm.markAllAsTouched();
    }
  }

  onSavePreferences(): void {
    if (this.preferencesForm.valid) {
      console.log('Preferences:', this.preferencesForm.value);
      // API call here
    } else {
      this.preferencesForm.markAllAsTouched();
    }
  }
}
