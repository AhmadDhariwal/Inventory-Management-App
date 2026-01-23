import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import { StockService } from '../../shared/services/stock.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { dashboardstats } from './overview.model';
import { StockTrendComponent } from '../charts/stock-trend/stock-trend.component';
import { WidgetCardComponent } from '../widgets/widget-card/widget-card.component';

interface Widget {
  title: string;
  value: number;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down';
}
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, KpiCardComponent, StockTrendComponent,WidgetCardComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit{

  widgets: Widget[] = [];
  stockTrendData = [120, 135, 110, 150, 170, 160];
  stockMonths = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

 loading = true;
  error: string | null = null;

  stats: any = {
    totalproducts: 0,
    totalsuppliers: 0,
    totalStock: 0,
    totalpurchases: 0
  };

  lowStockItems: any[] = [];

   constructor( private dashboardService: DashboardService, private stockService: StockService) {}

   ngOnInit() : void {
    this.loadDashboard();
    this.loadwidgets();
   }

    loadDashboard(): void {
    this.dashboardService.getdashboardstats().subscribe({
      next: data => {
        this.stats = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });

    // Load stock summary for low stock count
    this.stockService.getStockSummary({}).subscribe({
      next: summary => {
        this.stats.lowStockItems = summary.lowStockItems;
        this.updateWidgets();
      },
      error: err => console.error('Failed to load stock summary', err)
    });
    }

    loadwidgets(): void {
      this.stockService.getLowStock().subscribe({
        next: data => {
          this.lowStockItems = data;
          this.updateWidgets();
        },
        error: err => console.error('Failed to load low stock data', err)
      });
    }

    updateWidgets(): void {
      this.widgets = [
        { title: 'Total Products', value: this.stats.totalproducts || 0, color: '#4caf50', icon: 'fa fa-box', trend: 'up' },
        { title: 'Low Stock', value: this.lowStockItems.length, color: '#f44336', icon: 'fa fa-exclamation-triangle', trend: 'up' },
        { title: 'Total Stock', value: this.stats.totalStock || 0, color: '#ff9800', icon: 'fa fa-warehouse', trend: 'down' },
        { title: 'Suppliers', value: this.stats.totalsuppliers || 0, color: '#2196f3', icon: 'fa fa-user' }
      ];
    }
  }
