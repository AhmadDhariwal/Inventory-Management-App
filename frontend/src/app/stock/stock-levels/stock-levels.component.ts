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

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStockLevels();
  }

  loadStockLevels(): void {
    this.stockService.getStockLevels().subscribe({
      next: (data) => {
        this.stockLevels = data;
        this.extractWarehouses(data);
      },
      error: (err) => console.error('Stock load failed', err)
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

  selectedStock: any = null;

openDrawer(stock: any) {
  this.selectedStock = stock;
}

closeDrawer() {
  this.selectedStock = null;
}

}

