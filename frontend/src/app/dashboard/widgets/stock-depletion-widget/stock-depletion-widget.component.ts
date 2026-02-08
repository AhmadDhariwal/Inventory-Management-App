import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastingService, StockForecast } from '../../../shared/services/forecasting.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock-depletion-widget',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <div class="header-info">
          <h3>Stock Depletion Forecast</h3>
          <p>AI-predicted stock run-out dates based on consumption</p>
        </div>
        <div class="header-badge" *ngIf="!loading && forecasts.length > 0">
          {{ forecasts.length }} items at risk
        </div>
      </div>

      <div class="widget-body">
        <div *ngIf="loading" class="loading-state">
          <div class="skeleton-row" *ngFor="let i of [1,2,3]">
            <app-skeleton type="line" width="60%"></app-skeleton>
            <app-skeleton type="line" width="30%"></app-skeleton>
          </div>
        </div>

        <div *ngIf="!loading && forecasts.length === 0" class="empty-state">
          <i class="fas fa-check-circle"></i>
          <p>All stock levels are currently healthy</p>
        </div>

        <div *ngIf="!loading && forecasts.length > 0" class="forecast-list">
          <div class="forecast-item" *ngFor="let item of forecasts">
            <div class="item-info">
              <span class="product-name">{{ item.productName }}</span>
              <span class="consumption-rate">{{ item.avgDailyConsumption }}/day avg</span>
            </div>
            <div class="item-prediction" [ngClass]="getRiskClass(item.daysRemaining)">
              <span class="days">{{ item.daysRemaining === Infinity ? '∞' : item.daysRemaining + ' days' }}</span>
              <span class="label">remaining</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="widget-footer" *ngIf="!loading && forecasts.length > 0">
        <button class="view-all-btn" (click)="navigateToPurchases()">Develop Restock Plan</button>
      </div>
    </div>
  `,
  styles: [`
    .widget-container {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      h3 { font-weight: 700; color: var(--text-main); margin: 0; font-size: 1.1rem; }
      p { font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0; }
    }
    .header-badge {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .widget-body { flex: 1; overflow-y: auto; }
    .forecast-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-main);
      &:last-child { border-bottom: none; }
    }
    .item-info {
      display: flex;
      flex-direction: column;
      .product-name { font-weight: 600; color: var(--text-main); font-size: 0.95rem; }
      .consumption-rate { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
    }
    .item-prediction {
      text-align: right;
      display: flex;
      flex-direction: column;
      padding: 6px 12px;
      border-radius: 8px;
      min-width: 80px;
      .days { font-weight: 700; font-size: 1rem; }
      .label { font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }
      
      &.risk-high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      &.risk-medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      &.risk-low { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    }
    .empty-state {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-muted);
      i { font-size: 2.5rem; color: #22c55e; margin-bottom: 1rem; opacity: 0.5; }
    }
    .widget-footer {
      margin-top: 1.5rem;
      .view-all-btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--brand-primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
        &:hover { opacity: 0.9; }
      }
    }
    .skeleton-row { margin-bottom: 1rem; }
  `]
})
export class StockDepletionWidgetComponent implements OnInit {
  forecasts: StockForecast[] = [];
  loading = true;
  protected readonly Infinity = Infinity;
  private forecastingService = inject(ForecastingService);
  private router = inject(Router);

  ngOnInit(): void {
    this.forecastingService.getLowStockForecasts().subscribe({
      next: (data) => {
        this.forecasts = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getRiskClass(days: number): string {
    if (days <= 3) return 'risk-high';
    if (days <= 7) return 'risk-medium';
    return 'risk-low';
  }

  navigateToPurchases(): void {
    this.router.navigate(['/purchases/new']);
  }
}
