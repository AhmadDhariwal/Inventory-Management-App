import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesOrder } from '../models/inventory/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = 'http://localhost:3000/api/salesorders';

  constructor(private http: HttpClient) {}

  getSalesOrders(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(this.baseUrl);
  }

  createSalesOrder(order: SalesOrder): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/add`, order);
  }
}
