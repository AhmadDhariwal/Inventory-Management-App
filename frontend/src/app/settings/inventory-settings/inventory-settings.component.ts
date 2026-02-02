import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, InventorySettings } from '../../shared/services/user.service';

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
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
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
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.userService.getInventorySettings().subscribe({
      next: (response) => {
        if (response.success) {
          this.stockForm.patchValue(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading inventory settings:', error);
        this.errorMessage = 'Failed to load inventory settings';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSaveStockRules() {
    if (this.stockForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      
      this.userService.updateInventorySettings(this.stockForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Inventory settings updated successfully';
            setTimeout(() => this.successMessage = '', 3000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to update inventory settings';
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }
  }

  navigateToStockLevels() {
    this.router.navigate(['/stock/levels']);
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }
}
