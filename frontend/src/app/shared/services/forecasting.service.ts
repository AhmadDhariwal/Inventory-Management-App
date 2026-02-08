import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StockForecast {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailyConsumption: number;
  daysRemaining: number;
  daysToReorder: number;
  predictionDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ForecastingService {
  private baseUrl = 'http://localhost:3000/api/forecasting';
  private http = inject(HttpClient);

  getProductForecast(productId: string): Observable<StockForecast> {
    return this.http.get<{success: boolean, data: StockForecast}>(`${this.baseUrl}/products/${productId}`)
      .pipe(map(res => res.data));
  }

  getLowStockForecasts(): Observable<StockForecast[]> {
    return this.http.get<{success: boolean, data: StockForecast[]}>(`${this.baseUrl}/low-stock`)
      .pipe(map(res => res.data));
  }
}
