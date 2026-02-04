import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PurchaseOrder } from '../models/inventory/purchase-order.model';
import { ActivityLogsService } from './activity-logs.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl = 'http://localhost:3000/api/purchaseorders';
  private reportsUrl = 'http://localhost:3000/api/reports';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.baseUrl);
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  createPurchaseOrder(order: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/add`, order).pipe(
      tap((result: any) => {
        if (result && result._id) {
          this.activityService.logCreate('Purchase Orders', `PO-${result._id.slice(-6)}`, result._id).subscribe();
        }
      })
    );
  }

  deletePurchaseOrder(id: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.activityService.logDelete('Purchase Orders', 'Purchase Order', id).subscribe();
      })
    );
  }

  approvePurchaseOrder(id: string): Observable<{success: boolean, message: string, data: PurchaseOrder}> {
    return this.http.patch<{success: boolean, message: string, data: PurchaseOrder}>(`${this.baseUrl}/${id}/approve`, {}).pipe(
      tap((result) => {
        if (result && result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Purchase Orders',
            entityId: id,
            entityName: `PO-${id.slice(-6)}`,
            description: 'Purchase order approved'
          }).subscribe();
        }
      })
    );
  }

  receivePurchaseOrder(id: string): Observable<{success: boolean, message: string, data: any}> {
    return this.http.patch<{success: boolean, message: string, data: any}>(`${this.baseUrl}/${id}/receive`, {}).pipe(
      tap((result) => {
        if (result && result.success) {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Purchase Orders',
            entityId: id,
            entityName: `PO-${id.slice(-6)}`,
            description: 'Purchase order received'
          }).subscribe();
        }
      })
    );
  }

  // Purchase Reports
  getPurchaseReport(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.reportsUrl}/purchases`);
  }

  getAllSuppliers(): Observable<{success: boolean, data: Array<{_id: string, name: string}>}> {
    return this.http.get<{success: boolean, data: Array<{_id: string, name: string}>}>(`${this.reportsUrl}/purchases/suppliers`);
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
