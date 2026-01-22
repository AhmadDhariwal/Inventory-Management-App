// stock/stock-movement-report/stock-movement-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovement } from '../../shared/models/inventory/stock-movement.model';
import { StockService } from '../../shared/services/stock.service';

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
  isLoading = true;
  error: string | null = null;

  selectedType = 'ALL';
  selectedWarehouse = 'ALL';

  warehouses: string[] = ['ALL'];
  types: string[] = ['ALL', 'IN', 'OUT', 'ADJUSTMENT'];

  constructor(private stockService: StockService) {}

  exportCSV(): void {
    this.stockService.exportStockMovementsCSV({
      type: this.selectedType !== 'ALL' ? this.selectedType : undefined,
      warehouse: this.selectedWarehouse !== 'ALL' ? this.selectedWarehouse : undefined
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  exportExcel(): void {
    this.stockService.exportStockMovementsExcel({
      type: this.selectedType !== 'ALL' ? this.selectedType : undefined,
      warehouse: this.selectedWarehouse !== 'ALL' ? this.selectedWarehouse : undefined
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-movements-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  printReport(): void {
    window.print();
  }

  trackByMovement(index: number, movement: StockMovement): string {
    return movement._id || index.toString();
  }

  ngOnInit(): void {
    this.loadStockMovements();
  }

  loadStockMovements(): void {
    this.isLoading = true;
    this.error = null;
    this.stockService.getStockMovements().subscribe({
      next: data => {
        console.log('Raw movements data:', data);
        this.movements = data || [];
        this.extractWarehouses();
        this.applyFilters();
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load stock movements', err);
        this.error = 'Failed to load stock movements. Please try again.';
        this.isLoading = false;
      }
    });
  }

  extractWarehouses(): void {
    const whSet = new Set<string>();
    this.movements.forEach(m => {
      if (m.warehouse && m.warehouse.name) {
        whSet.add(m.warehouse.name);
      }
    });
    this.warehouses = ['ALL', ...Array.from(whSet)];
    console.log('Extracted warehouses:', this.warehouses);
  }

  applyFilters(): void {
    console.log('Applying filters - Type:', this.selectedType, 'Warehouse:', this.selectedWarehouse);

    this.filteredMovements = this.movements.filter(m => {
      const typeMatch = this.selectedType === 'ALL' || m.type === this.selectedType;
      const warehouseMatch = this.selectedWarehouse === 'ALL' ||
        (m.warehouse && m.warehouse.name === this.selectedWarehouse);

      return typeMatch && warehouseMatch;
    });

    console.log('Filtered movements count:', this.filteredMovements.length);
    console.log('Total movements count:', this.movements.length);
  }
}
