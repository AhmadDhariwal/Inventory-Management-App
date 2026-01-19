// stock/stock-movement-report/stock-movement-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovement } from '../../../shared/models/inventory/stock-movement.model';
import { StockService } from '../../../shared/services/stock.service';

@Component({
  selector: 'app-stock-movement-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movement-report.component.html',
  styleUrls: ['./stock-movement-report.component.scss']
})
export class StockMovementReportComponent implements OnInit {

  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];

  selectedType = 'ALL';
  selectedWarehouse = 'ALL';

  warehouses: string[] = ['ALL'];
  types: string[] = ['ALL', 'IN', 'OUT', 'ADJUSTMENT'];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStockMovements();
  }

  loadStockMovements(): void {
    this.stockService.getStockMovements().subscribe({
      next: data => {
        this.movements = data;
        this.extractWarehouses();
        this.applyFilters();
      },
      error: err => {
        console.error('Failed to load stock movements', err);
      }
    });
  }

  extractWarehouses(): void {
    const whSet = new Set<string>();
    this.movements.forEach(m => whSet.add(m.warehouse.name));
    this.warehouses = ['ALL', ...Array.from(whSet)];
  }

  applyFilters(): void {
    this.filteredMovements = this.movements.filter(m =>
      (this.selectedType === 'ALL' || m.type === this.selectedType) &&
      (this.selectedWarehouse === 'ALL' || m.warehouse.name === this.selectedWarehouse)
    );
  }
}
