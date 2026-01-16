import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StockService } from '../../shared/services/stock.service';

@Component({
  selector: 'app-stock-overview',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './stock-overview.component.html',
  styleUrl: './stock-overview.component.scss'
})
export class StockOverviewComponent implements OnInit {
  totalProducts = 0;
  totalStock = 0;
  totalValue = 0;
  lowStockCount = 0;
  lowStockItems: any[] = [];
  loading = true;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadOverviewData();
  }

  loadOverviewData(): void {
    this.stockService.getStockLevels().subscribe({
      next: (levels) => {
        this.totalProducts = levels.length;
        this.totalStock = levels.reduce((sum, item) => sum + (item.availableQty || 0), 0);
        this.totalValue = levels.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stock levels:', err);
        this.loading = false;
      }
    });

    this.stockService.getLowStock().subscribe({
      next: (lowStock) => {
        this.lowStockItems = lowStock;
        this.lowStockCount = lowStock.length;
      },
      error: (err) => console.error('Error loading low stock:', err)
    });
  }
}
