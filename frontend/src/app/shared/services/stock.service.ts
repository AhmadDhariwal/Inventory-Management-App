import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InventorySummary } from '../models/inventory/inventory-summary.model';
import { ActivityLogsService } from './activity-logs.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

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
    }).pipe(
      tap(() => {
        this.activityService.createLog({
          action: 'CREATE',
          module: 'Stock Management',
          entityName: `Stock ${movement.type}`,
          description: `${movement.type === 'IN' ? 'Added' : 'Removed'} ${movement.quantity} units - ${movement.reason}`
        }).subscribe();
      })
    );
  }

  getStockLevels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/reports/stocklevels`);
  }

  getLowStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/reports/lowstock`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/products`);
  }

  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/warehouses`);
  }
  exportStockMovementsCSV(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/stockmovements/export/csv?${params.toString()}`,
      { responseType: 'blob' }
    );
  }

  exportStockMovementsExcel(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/stockmovements/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
  }

  exportStockSummaryCSV(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/summary/export/csv?${params.toString()}`,
      { responseType: 'blob' }
    );
  }

  exportStockSummaryExcel(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/summary/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getStockSummary(filters: any): Observable<InventorySummary> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);
    if (filters.productId) params.append('productId', filters.productId);

    return this.http.get<InventorySummary>(`${this.baseUrl}/api/reports/summary?${params.toString()}`);
  }

  exportPurchaseOrdersCSV(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/purchases/export/csv?${params.toString()}`,
      { responseType: 'blob' }
    );
  }

  exportPurchaseOrdersExcel(filters: any): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return this.http.get(
      `${this.baseUrl}/api/reports/purchases/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
  }
}
