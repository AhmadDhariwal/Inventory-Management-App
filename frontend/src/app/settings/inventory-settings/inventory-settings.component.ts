import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './inventory-settings.component.html',
  styleUrl: './inventory-settings.component.scss'
})
export class InventorySettingsComponent implements OnInit {
  stockForm: FormGroup;
  valuationForm: FormGroup;
  automationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.stockForm = this.fb.group({
      lowStockThreshold: [10, [Validators.required, Validators.min(1)]],
      criticalStockThreshold: [5, [Validators.required, Validators.min(1)]],
      reorderPoint: [20, [Validators.required, Validators.min(1)]],
      maxStockLevel: [1000, [Validators.required, Validators.min(1)]],
      enableNegativeStock: [false],
      trackSerialNumbers: [true],
      trackBatchNumbers: [true]
    });

    this.valuationForm = this.fb.group({
      costingMethod: ['FIFO', Validators.required],
      includeShippingCosts: [true],
      includeTaxInCost: [false],
      roundingPrecision: [2, [Validators.required, Validators.min(0), Validators.max(4)]]
    });

    this.automationForm = this.fb.group({
      autoReorder: [false],
      autoReceiveOrders: [false],
      sendLowStockAlerts: [true],
      sendExpiryAlerts: [true],
      alertDaysBefore: [30, [Validators.required, Validators.min(1)]],
      enableBarcodeScan: [true]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Load existing settings from API
  }

  onSaveStock() {
    if (this.stockForm.valid) {
      console.log('Stock settings:', this.stockForm.value);
    }
  }

  onSaveValuation() {
    if (this.valuationForm.valid) {
      console.log('Valuation settings:', this.valuationForm.value);
    }
  }

  onSaveAutomation() {
    if (this.automationForm.valid) {
      console.log('Automation settings:', this.automationForm.value);
    }
  }
}
