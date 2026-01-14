import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
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

  stats: any = null;

   constructor( private dashboardService: DashboardService) {}

   ngOnInit() : void {
    this.loadDashboard();
     this.widgets = [
      { title: 'Total Products', value: 120, color: '#4caf50', icon: 'fa fa-box', trend: 'up' },
      { title: 'Low Stock', value: 12, color: '#f44336', icon: 'fa fa-exclamation-triangle', trend: 'up' },
      { title: 'Pending Orders', value: 8, color: '#ff9800', icon: 'fa fa-shopping-cart', trend: 'down' },
      { title: 'Top Supplier', value: 1, color: '#2196f3', icon: 'fa fa-user' }
    ];
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
    }
  }
