import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../shared/services/stock.service';
import { StockDetailDrawerComponent } from '../stock-detail-drawer/stock-detail-drawer.component';

@Component({
  selector: 'app-stock-levels',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule,StockDetailDrawerComponent],
  templateUrl: './stock-levels.component.html',
  styleUrl: './stock-levels.component.scss'
})
export class StockLevelsComponent implements OnInit {
  searchText = '';
  selectedWarehouse = 'ALL';
  warehouses: string[] = ['ALL'];
  stockLevels: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStockLevels();
  }

  loadStockLevels(): void {
    this.loading = true;
    this.errorMessage = '';
    this.stockService.getStockLevels().subscribe({
      next: (data) => {
        console.log('Stock levels data:', data);
        this.stockLevels = data;
        this.extractWarehouses(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Stock load failed', err);
        this.errorMessage = err.error?.error || err.message || 'Failed to load stock levels';
        this.loading = false;
      }
    });
  }

  extractWarehouses(data: any[]): void {
    const uniqueWarehouses = [...new Set(data.map(item => item.warehouseName))];
    this.warehouses = ['ALL', ...uniqueWarehouses];
  }

  filteredStock() {
    return this.stockLevels.filter(item =>
      (this.selectedWarehouse === 'ALL' || item.warehouseName === this.selectedWarehouse) &&
      (item.productName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
       item.sku?.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  getTotalItems(): number {
    return this.stockLevels.length;
  }

  getCriticalItems(): number {
    return this.stockLevels.filter(item => item.status === 'CRITICAL').length;
  }

  getStockPercentage(item: any): number {
    const maxStock = item.reorderLevel * 3;
    return Math.min((item.availableQty / maxStock) * 100, 100);
  }

  getProgressClass(item: any): string {
    if (item.availableQty <= item.reorderLevel * 0.5) {
      return 'progress-critical';
    } else if (item.availableQty <= item.reorderLevel) {
      return 'progress-low';
    }
    return 'progress-ok';
  }

  viewMode: 'cards' | 'table' = 'cards';

  selectedStock: any = null;

openDrawer(stock: any) {
  this.selectedStock = stock;
}

closeDrawer() {
  this.selectedStock = null;
}

}

