import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../shared/services/warehouse.service';
import { Warehouse } from '../../shared/models/inventory/warehouse.model';

@Component({
  selector: 'app-warehouse-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-management.component.html',
  styleUrls: ['./warehouse-management.component.scss']
})
export class WarehouseManagementComponent implements OnInit {
  warehouses: Warehouse[] = [];
  newWarehouseName = '';
  newWarehouseAddress = '';
  isLoading = false;
  error = '';
  success = '';
  isEditing = false;
  editWarehouseId = '';

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.isLoading = true;
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
        this.error = 'Failed to load warehouses.';
        this.isLoading = false;
      }
    });
  }

  saveWarehouse(): void {
    if (!this.newWarehouseName.trim() || !this.newWarehouseAddress.trim()) {
      this.error = 'Please provide both name and address.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    const warehouseData: Partial<Warehouse> = {
      name: this.newWarehouseName,
      address: this.newWarehouseAddress
    };

    if (this.isEditing) {
      this.warehouseService.updateWarehouse(this.editWarehouseId, warehouseData).subscribe({
        next: (res) => {
          this.success = 'Warehouse updated successfully!';
          this.resetForm();
          this.loadWarehouses();
          this.isLoading = false;
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          console.error('Error updating warehouse:', err);
          this.error = err.error?.message || 'Failed to update warehouse.';
          this.isLoading = false;
        }
      });
    } else {
      this.warehouseService.createWarehouse(warehouseData).subscribe({
        next: (res) => {
          this.success = 'Warehouse added successfully!';
          this.resetForm();
          this.loadWarehouses();
          this.isLoading = false;
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          console.error('Error adding warehouse:', err);
          this.error = err.error?.message || 'Failed to add warehouse.';
          this.isLoading = false;
        }
      });
    }
  }

  editWarehouse(wh: Warehouse): void {   
    this.isEditing = true;
    this.editWarehouseId = wh._id || '';
    this.newWarehouseName = wh.name;
    this.newWarehouseAddress = wh.address;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.editWarehouseId = '';
    this.newWarehouseName = '';
    this.newWarehouseAddress = '';
    this.error = '';
  }

  deleteWarehouse(id: string): void {
    if (!confirm('Are you sure you want to deactivate this warehouse?')) return;

    this.isLoading = true;
    this.warehouseService.deleteWarehouse(id).subscribe({
      next: () => {
        this.success = 'Warehouse deactivated successfully!';
        this.loadWarehouses();
        this.isLoading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        console.error('Error deleting warehouse:', err);
        this.error = 'Failed to deactivate warehouse.';
        this.isLoading = false;
      }
    });
  }
}
