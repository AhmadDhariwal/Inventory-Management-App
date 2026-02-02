import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder } from '../models/inventory/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl = 'http://localhost:3000/api/purchaseorders';
  private reportsUrl = 'http://localhost:3000/api/reports';

  constructor(private http: HttpClient) {}

  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.baseUrl);
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  createPurchaseOrder(order: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/add`, order);
  }

  deletePurchaseOrder(id: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/${id}`);
  }

  approvePurchaseOrder(id: string): Observable<{success: boolean, message: string, data: PurchaseOrder}> {
    return this.http.patch<{success: boolean, message: string, data: PurchaseOrder}>(`${this.baseUrl}/${id}/approve`, {});
  }

  receivePurchaseOrder(id: string): Observable<{success: boolean, message: string, data: any}> {
    return this.http.patch<{success: boolean, message: string, data: any}>(`${this.baseUrl}/${id}/receive`, {});
  }

  // Purchase Reports
  getPurchaseReport(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.reportsUrl}/purchases`);
  }

  exportPurchaseReportCSV(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/purchases/export/csv`, {
      responseType: 'blob'
    });
  }

  exportPurchaseReportExcel(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/purchases/export/excel`, {
      responseType: 'blob'
    });
  }

}
