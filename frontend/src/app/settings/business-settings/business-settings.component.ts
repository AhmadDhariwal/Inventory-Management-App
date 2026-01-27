import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      industry: [''],
      address: [''],
      phone: [''],
      email: ['', Validators.email]
    });

    this.regionalForm = this.fb.group({
      currency: ['', Validators.required],
      timezone: ['', Validators.required],
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
    // Load existing settings from API
    // This would typically fetch from a service
  }

  onSaveCompany() {
    if (this.companyForm.valid) {
      console.log('Company settings:', this.companyForm.value);
      // Save company settings via API
    }
  }

  onSaveRegional() {
    if (this.regionalForm.valid) {
      console.log('Regional settings:', this.regionalForm.value);
      // Save regional settings via API
    }
  }

  onSavePreferences() {
    if (this.preferencesForm.valid) {
      console.log('Preferences:', this.preferencesForm.value);
      // Save preferences via API
    }
  }
}
