import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovement } from '../../../shared/models/inventory/stock-movement.model';

@Component({
  selector: 'app-stock-movement-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movement-report.component.html',
  styleUrl: './stock-movement-report.component.scss'
})
export class StockMovementReportComponent implements OnInit {

  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];

  selectedType = 'ALL';
  selectedWarehouse = 'ALL';

  warehouses = ['ALL', 'Karachi WH', 'Lahore WH'];
  types = ['ALL', 'IN', 'OUT', 'ADJUSTMENT'];

  ngOnInit(): void {
    this.loadMockData();
    this.applyFilters();
  }

  loadMockData(): void {
    this.movements = [
      {
        _id: '1',
        product: { _id: '1', name: 'Wireless Mouse', sku: 'SKU-001', cost: 15.50, price: 29.99, status: 'active' },
        warehouse: { _id: '1', name: 'Karachi WH', address: 'Karachi', isActive: true },
        type: 'IN',
        quantity: 100,
        reason: 'Purchase Order #PO-1021',
        user: { _id: '1', name: 'Admin' },
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z'
      },
      {
        _id: '2',
        product: { _id: '2', name: 'USB-C Cable', sku: 'SKU-003', cost: 3.50, price: 12.99, status: 'active' },
        warehouse: { _id: '2', name: 'Lahore WH', address: 'Lahore', isActive: true },
        type: 'OUT',
        quantity: 20,
        reason: 'Sales Order #SO-339',
        user: { _id: '2', name: 'Warehouse Manager' },
        createdAt: '2025-01-12T10:00:00.000Z',
        updatedAt: '2025-01-12T10:00:00.000Z'
      }
    ];
  }

  applyFilters(): void {
    this.filteredMovements = this.movements.filter(m =>
      (this.selectedType === 'ALL' || m.type === this.selectedType) &&
      (this.selectedWarehouse === 'ALL' || m.warehouse.name === this.selectedWarehouse)
    );
  }
}
