import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SalesOrder } from '../models/inventory/sales-order.model';
import { ActivityLogsService } from './activity-logs.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = 'http://localhost:3000/api/salesorders';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

  getSalesOrders(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(this.baseUrl);
  }

  createSalesOrder(order: SalesOrder): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/add`, order).pipe(
      tap((result: any) => {
        this.activityService.logCreate('Sales Orders', `SO-${result._id?.slice(-6)}`, result._id).subscribe();
      })
    );
  }
}
