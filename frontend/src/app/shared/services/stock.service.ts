import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {

    private baseUrl = 'http://localhost:3000';


   constructor(private http: HttpClient) {}

  getStockMovements(): Observable<any[]> {
    const url = `${this.baseUrl}/api/reports/stockmovements`;
    return this.http.get<any[]>(url);
  }

  // createStockMovement(payload: any): Observable<any> {
  //   const url = `${this.baseUrl}/api/reports/stockmovements`;
  //   return this.http.post(url, payload);
  // }
  createStockMovement(payload: any): Observable<any> {
  const endpoint = payload.type === 'IN' ? 'add' : 'remove';
  const url = `${this.baseUrl}/api/inventory/${endpoint}`;
  return this.http.post(url, {
    productId: payload.product,
    warehouseId: payload.warehouse,
    quantity: payload.quantity,
    reason: payload.reason
  });
}

   getProducts(): Observable<any[]> {
    const url = `${this.baseUrl}/api/products`;
    return this.http.get<any[]>(url);
  }

  getWarehouses(): Observable<any[]> {
        const url = `${this.baseUrl}/api/warehouses`;
    return this.http.get<any[]>(url);
  }
}
