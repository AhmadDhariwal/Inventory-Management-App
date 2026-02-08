// stock/stock-movement-report/stock-movement-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovement } from '../../shared/models/inventory/stock-movement.model';
import { StockService } from '../../shared/services/stock.service';
import { ExportService } from '../../shared/services/export.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-stock-movement-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
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

  constructor(
    private stockService: StockService,
    private exportService: ExportService,
    private datePipe: DatePipe
  ) {}

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
    const dataToExport = this.filteredMovements.map(m => ({
      Date: this.datePipe.transform(m.createdAt, 'mediumDate'),
      SKU: this.getSku(m),
      Product: this.getProductName(m),
      Warehouse: this.getWarehouseName(m),
      Type: m.type,
      Quantity: m.quantity,
      Reason: m.reason || 'N/A',
      'Performed By': this.getUserName(m)
    }));

    this.exportService.exportToExcel(dataToExport, 'Stock_Movements', 'Movements');
  }

  exportPDF(): void {
    const headers = ['Date', 'SKU', 'Product', 'Warehouse', 'Type', 'Qty', 'Reason', 'User'];
    const data = this.filteredMovements.map(m => [
      this.datePipe.transform(m.createdAt, 'MMM d, y'),
      this.getSku(m),
      this.getProductName(m),
      this.getWarehouseName(m),
      m.type,
      m.quantity.toString(),
      m.reason || 'N/A',
      this.getUserName(m)
    ]);

    this.exportService.exportToPdf(headers, data, 'Stock_Movements', 'Stock Movement Detailed Report');
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

  getMovementClass(type: string | undefined): string {
    return type ? type.toLowerCase() : '';
  }

  // Helper methods to avoid template errors with optional chaining
  getSku(m: StockMovement): string {
    return m.product ? m.product.sku : 'N/A';
  }

  getProductName(m: StockMovement): string {
    return m.product ? m.product.name : 'N/A';
  }

  getWarehouseName(m: StockMovement): string {
    return m.warehouse ? m.warehouse.name : 'N/A';
  }

  getUserName(m: StockMovement): string {
    return m.user ? m.user.name : 'System';
  }
}
