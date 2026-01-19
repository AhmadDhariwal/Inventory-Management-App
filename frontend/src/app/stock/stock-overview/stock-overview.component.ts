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



// import { Component, OnInit } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { StockService } from '../../shared/services/stock.service';
// import { InventorySummary } from '../../shared/models/inventory/inventory-summary.model';

// @Component({
//   selector: 'app-stock-overview',
//   standalone: true,
//   imports: [RouterLink, CommonModule],
//   templateUrl: './stock-overview.component.html',
//   styleUrl: './stock-overview.component.scss'
// })
// export class StockOverviewComponent implements OnInit {
//   summary: InventorySummary = {
//     totalProducts: 0,
//     totalStock: 0,
//     lowStockItems: 0,
//     warehouses: 0,
//     inventoryValue: 0
//   };
//   recentMovements: any[] = [];
//   lowStockItems: any[] = [];
//   loading = true;

//   constructor(private stockService: StockService) {}

//   ngOnInit(): void {
//     this.loadSummary();
//     this.loadRecentMovements();
//     this.loadLowStock();
//   }

//   loadSummary(): void {
//     this.stockService.getStockSummary().subscribe({
//       next: (data) => {
//         this.summary = data;
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Error loading summary:', err);
//         this.loading = false;
//       }
//     });
//   }

//   loadRecentMovements(): void {
//     this.stockService.getStockMovements().subscribe({
//       next: (movements) => {
//         this.recentMovements = movements.slice(0, 5); // Latest 5 movements
//       },
//       error: (err) => console.error('Error loading movements:', err)
//     });
//   }

//   loadLowStock(): void {
//     this.stockService.getLowStock().subscribe({
//       next: (lowStock) => {
//         this.lowStockItems = lowStock.slice(0, 5); // Top 5 low stock items
//       },
//       error: (err) => console.error('Error loading low stock:', err)
//     });
//   }
// }
