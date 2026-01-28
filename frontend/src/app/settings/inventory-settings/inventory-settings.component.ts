import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockRuleService } from '../../shared/services/stock-rule.service';
import { StockRule } from '../../shared/models/inventory/stock-rule.model';

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

  constructor(
    private fb: FormBuilder,
    private stockRuleService: StockRuleService
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
    this.loadStockRules();
  }

  loadStockRules() {
    this.isLoading = true;
    this.stockRuleService.getRules().subscribe({
      next: (rules: StockRule) => {
        this.stockForm.patchValue(rules);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stock rules:', error);
        this.isLoading = false;
      }
    });
  }

  onSaveStockRules() {
    if (this.stockForm.valid) {
      // Validate thresholds
      const formValue = this.stockForm.value;
      if (formValue.criticalStockThreshold > formValue.lowStockThreshold) {
        alert('Critical threshold cannot be higher than low stock threshold');
        return;
      }

      this.isSaving = true;
      this.stockRuleService.updateRules(formValue).subscribe({
        next: (rules: StockRule) => {
          console.log('Stock rules updated:', rules);
          alert('Stock rules updated successfully!');
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating stock rules:', error);
          alert('Error updating stock rules. Please try again.');
          this.isSaving = false;
        }
      });
    }
  }
}
