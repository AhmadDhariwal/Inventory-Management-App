// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';

// interface StockSummary {
//   totalSkus: number;
//   totalQuantity: number;
//   totalValue: number;
//   lowStockCount: number;
//   criticalStockCount: number;
// }

// @Component({
//   selector: 'app-stock-summary-report',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './stock-summary.component.html',
//   styleUrl: './stock-summary.component.scss'
// })
// export class StockSummaryComponent implements OnInit {

//   summary!: StockSummary;

//   ngOnInit(): void {
//     this.calculateSummary();
//   }

//   private calculateSummary(): void {
//     // TEMP: derived from stock-levels data
//     this.summary = {
//       totalSkus: 128,
//       totalQuantity: 18_450,
//       totalValue: 4_250_000,
//       lowStockCount: 14,
//       criticalStockCount: 6
//     };
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovement } from '../../../shared/models/inventory/stock-movement.model';

interface StockSummary {
  productId: string;
  productName: string;
  sku: string;
  warehouseName: string;
  availableQuantity: number;
}

@Component({
  selector: 'app-stock-summary-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-summary.component.html',
  styleUrl: './stock-summary.component.scss'
})
export class StockSummaryComponent implements OnInit {

  movements: StockMovement[] = [];
  summary: StockSummary[] = [];

  ngOnInit(): void {
    this.loadMockMovements();
    this.calculateStockSummary();
  }

  loadMockMovements(): void {
    this.movements = [
      {
        _id: '1',
        product: { _id: '1', name: 'Wireless Mouse', sku: 'SKU-001', cost: 15, price: 30, status: 'active' },
        warehouse: { _id: '1', name: 'Karachi WH', address: 'Karachi', isActive: true },
        type: 'IN',
        quantity: 100,
        reason: 'Purchase Order',
        user: { _id: '1', name: 'Admin' },
        createdAt: '',
        updatedAt: ''
      },
      {
        _id: '2',
        product: { _id: '1', name: 'Wireless Mouse', sku: 'SKU-001', cost: 15, price: 30, status: 'active' },
        warehouse: { _id: '1', name: 'Karachi WH', address: 'Karachi', isActive: true },
        type: 'OUT',
        quantity: 30,
        reason: 'Sales Order',
        user: { _id: '2', name: 'Manager' },
        createdAt: '',
        updatedAt: ''
      }
    ];
  }

  calculateStockSummary(): void {
    const map = new Map<string, StockSummary>();

    this.movements.forEach(m => {
      const key = `${m.product._id}-${m.warehouse._id}`;

      if (!map.has(key)) {
        map.set(key, {
          productId: m.product._id,
          productName: m.product.name,
          sku: m.product.sku,
          warehouseName: m.warehouse.name,
          availableQuantity: 0
        });
      }

      const record = map.get(key)!;

      if (m.type === 'IN') {
        record.availableQuantity += m.quantity;
      }

      if (m.type === 'OUT') {
        record.availableQuantity -= m.quantity;
      }
    });

    this.summary = Array.from(map.values());
  }
}
