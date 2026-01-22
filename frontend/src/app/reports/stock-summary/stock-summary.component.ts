import { Component, OnInit,input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../shared/services/stock.service';
import { InventorySummary } from '../../shared/models/inventory/inventory-summary.model';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-stock-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent],
  templateUrl: './stock-summary.component.html',
  styleUrls: ['./stock-summary.component.scss']
})
export class StockSummaryComponent implements OnInit {

  summary: InventorySummary = {
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    warehouses: 0,
    inventoryValue: 0
  };
  loading = true;
  filters = {
    startDate: '',
    endDate: '',
    warehouseId: '',
    productId: ''
  };

  lowStockItems :any[]=[];
  warehouses: any[] = [];
  products: any[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
     this.loadWarehouses();
     this.loadProducts();
     this.loadstocksummary();
    // this.loadlowstock();
  }

  loadWarehouses(): void {
    this.stockService.getWarehouses().subscribe({
      next: data => this.warehouses = data,
      error: err => console.error('Error loading warehouses:', err)
    });
  }
  loadlowstock() :void{
    this.stockService.getLowStock().subscribe({
      next: (lowStock) => {
        this.lowStockItems = lowStock;
      },
      error: (err) => console.error('Error loading low stock:', err)
    });
  }

  loadProducts(): void {
    this.stockService.getProducts().subscribe({
      next: data => this.products = data,
      error: err => console.error('Error loading products:', err)
    });
  }

  loadstocksummary(): void {
    this.loading = true;
    this.stockService.getStockSummary(this.filters).subscribe({
      next: data => {
        this.summary = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading stock summary:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadstocksummary();
  }

  clearFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      warehouseId: '',
      productId: ''
    };
    this.loadstocksummary();
  }

  exportCSV(): void {
    this.stockService.exportStockSummaryCSV(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-summary-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  exportExcel(): void {
    this.stockService.exportStockSummaryExcel(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-summary-${new Date().toISOString().split('T')[0]}.xlsx`;
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
}

