import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './inventory-settings.component.html',
  styleUrl: './inventory-settings.component.scss'
})
export class InventorySettingsComponent implements OnInit {
  stockForm: FormGroup;
  isLoading = false;
  isSaving = false;
  showMigrationMessage = true;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.stockForm = this.fb.group({
      allowNegativeStock: [false],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      criticalStockThreshold: [5, [Validators.required, Validators.min(0)]],
      enableLowStockAlert: [true],
      autoUpdateStock: [true],
      requireApprovalForRemoval: [false],
      autoReceivePurchase: [false],
      autoDeductSales: [true],
      enableBarcodeScanning: [true],
      trackSerialNumbers: [false],
      trackBatchNumbers: [false]
    });
  }

  ngOnInit() {
    // Stock rules are now managed at individual stock level
    // Show migration message
  }

  navigateToStockLevels() {
    this.router.navigate(['/stock/levels']);
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  dismissMigrationMessage() {
    this.showMigrationMessage = false;
  }

  onSaveStockRules() {
    // This functionality has been moved to individual stock levels
    alert('Stock rules are now managed at individual product stock levels. Please go to Products or Stock Levels to configure reorder levels and minimum stock.');
  }
}
