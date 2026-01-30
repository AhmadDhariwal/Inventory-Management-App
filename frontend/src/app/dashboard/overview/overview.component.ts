import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../shared/services/dashboard.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  private refreshSubscription?: Subscription;

  stats: any = {
    totalproducts: 0,
    totalsuppliers: 0,
    totalStock: 0,
    totalpurchases: 0,
    lowStockItems: 0,
    stockInToday: 0,
    stockOutToday: 0,
    pendingPurchases: 0
  };

  lowStockItems: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboard(): void {
    this.dashboardService.getdashboardstats().subscribe({
      next: data => {
        console.log('Dashboard data received:', data);
        this.stats = {
          totalproducts: data.kpis?.totalProducts || 0,
          totalsuppliers: data.kpis?.totalSuppliers || 0,
          totalStock: data.kpis?.totalStockQty || 0,
          totalpurchases: data.kpis?.totalPurchaseAmount || 0,
          lowStockItems: data.alerts?.lowStockCount || 0,
          stockInToday: data.widgets?.stockInToday || 0,
          stockOutToday: data.widgets?.stockOutToday || 0,
          pendingPurchases: data.widgets?.pendingPurchases || 0
        };
        this.lowStockItems = data.alerts?.lowStockItems || [];
        this.loading = false;
        this.error = null;
      },
      error: err => {
        console.error('Dashboard error:', err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  startAutoRefresh(): void {
    // Refresh every 30 seconds
    this.refreshSubscription = interval(30000)
      .pipe(switchMap(() => this.dashboardService.getdashboardstats()))
      .subscribe({
        next: data => {
          this.stats = {
            totalproducts: data.kpis?.totalProducts || 0,
            totalsuppliers: data.kpis?.totalSuppliers || 0,
            totalStock: data.kpis?.totalStockQty || 0,
            totalpurchases: data.kpis?.totalPurchaseAmount || 0,
            lowStockItems: data.alerts?.lowStockCount || 0,
            stockInToday: data.widgets?.stockInToday || 0,
            stockOutToday: data.widgets?.stockOutToday || 0,
            pendingPurchases: data.widgets?.pendingPurchases || 0
          };
          this.lowStockItems = data.alerts?.lowStockItems || [];
        },
        error: err => console.error('Auto-refresh error:', err)
      });
  }

  navigateToProduct(item: any): void {
    if (item.productId) {
      this.router.navigate(['/products', item.productId]);
    }
  }

  trackByProductId(index: number, item: any): any {
    return item.productName + item.warehouseName;
  }
}
