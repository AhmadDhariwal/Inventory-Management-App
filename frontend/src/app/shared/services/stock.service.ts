import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventorySummary } from '../models/inventory/inventory-summary.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getStockMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/reports/stockmovements`);
  }

  createStockMovement(movement: any): Observable<any> {
    const endpoint = movement.type === 'IN' ? 'add' : 'remove';
    return this.http.post<any>(`${this.baseUrl}/api/inventory/${endpoint}`, {
      productId: movement.product,
      warehouseId: movement.warehouse,
      quantity: movement.quantity,
      reason: movement.reason
    });
  }

  getStockLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/reports/stocklevels`);
  }

  getLowStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/reports/stockrules`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/products`);
  }

  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/warehouses`);
  }
  getStockSummary(): Observable<InventorySummary> {
    return this.http.get<InventorySummary>(`${this.baseUrl}/api/reports/summary`);
  }
}
