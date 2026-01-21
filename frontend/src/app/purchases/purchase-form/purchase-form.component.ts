import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PurchaseService } from '../../shared/services/purchase.service';
import { StockService } from '../../shared/services/stock.service';
import { SupplierService } from '../../shared/services/supplier.service';
import { Supplier } from '../../shared/models/inventory/supplier.model';
import { Product } from '../../shared/models/inventory/product.model';
import { Warehouse } from '../../shared/models/inventory/warehouse.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-form.component.html',
  styleUrl: './purchase-form.component.scss'
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm: FormGroup;
  suppliers: Supplier[] = [];
  products: Product[] = [];
  warehouses: Warehouse[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private stockService: StockService,
    private supplierService: SupplierService
  ) {
    this.purchaseForm = this.fb.group({
      supplier: ['', Validators.required],
      warehouse: ['', Validators.required],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    this.loadWarehouses();
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      costprice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadSuppliers(): void {
   // console.log('Loading suppliers...');
    this.supplierService.getSuppliers().subscribe({
      next: data => {
     //   console.log('Suppliers loaded:', data);
        this.suppliers = data;
      },
      error: err => {
        console.error('Error loading suppliers:', err);
      }
    });
  }

  loadProducts(): void {
    this.stockService.getProducts().subscribe({
      next: data => this.products = data,
      error: err => console.error('Error loading products:', err)
    });
  }

  loadWarehouses(): void {
    this.stockService.getWarehouses().subscribe({
      next: data => this.warehouses = data,
      error: err => console.error('Error loading warehouses:', err)
    });
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      this.loading = true;

      // Calculate total amount
      const formValue = this.purchaseForm.value;
      console.log('Form value before processing:', formValue);

      // Ensure numeric values
      const processedItems = formValue.items.map((item: any) => ({
        product: item.product,
        quantity: Number(item.quantity),
        costprice: Number(item.costprice)
      }));

      const totalamount = processedItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.costprice);
      }, 0);

      const purchaseOrderData = {
        supplier: formValue.supplier,
        warehouse: formValue.warehouse,
        items: processedItems,
        totalamount: Number(totalamount.toFixed(2))
      };

    //  console.log('Purchase order data being sent:', purchaseOrderData);

      this.purchaseService.createPurchaseOrder(purchaseOrderData).subscribe({
        next: (data) => {
          this.loading = false;
          //console.log('Purchase order created successfully:', data);
          // Reset form after successful creation
          this.purchaseForm.reset();
          this.purchaseForm = this.fb.group({
            supplier: ['', Validators.required],
            warehouse: ['', Validators.required],
            items: this.fb.array([this.createItemGroup()])
          });
        },
        error: (err) => {
          this.loading = false;
          console.error('Error creating purchase order:', err);
        }
      });
    } else {
      console.log('Form is invalid:', this.purchaseForm.errors);
      console.log('Form value:', this.purchaseForm.value);
      // Mark all fields as touched to show validation errors
      this.purchaseForm.markAllAsTouched();
    }
  }
}
