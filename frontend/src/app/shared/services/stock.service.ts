// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class StockService {

//     private baseUrl = 'http://localhost:3000';


//    constructor(private http: HttpClient) {}

//   getStockMovements(): Observable<any[]> {
//     const url = `${this.baseUrl}/api/reports/stockmovements`;
//     return this.http.get<any[]>(url);
//   }

//   // createStockMovement(payload: any): Observable<any> {
//   //   const url = `${this.baseUrl}/api/reports/stockmovements`;
//   //   return this.http.post(url, payload);
//   // }
//   createStockMovement(payload: any): Observable<any> {
//   const endpoint = payload.type === 'IN' ? 'add' : 'remove';
//   const url = `${this.baseUrl}/api/inventory/${endpoint}`;
//   return this.http.post(url, {
//     productId: payload.product,
//     warehouseId: payload.warehouse,
//     quantity: payload.quantity,
//     reason: payload.reason
//   });
// }

//    getProducts(): Observable<any[]> {
//     const url = `${this.baseUrl}/api/products`;
//     return this.http.get<any[]>(url);
//   }

//   getWarehouses(): Observable<any[]> {
//         const url = `${this.baseUrl}/api/warehouses`;
//     return this.http.get<any[]>(url);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockMovement } from '../models/inventory/stock-movement.model';
import { StockLevel } from '../models/inventory/stock-level.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getStockMovements(): Observable<StockMovement[]> {
        const url = `${this.baseUrl}/api/reports/stockmovement`;
    return this.http.get<StockMovement[]>(url);
  }

  createStockMovement(movement: any): Observable<any> {
   const endpoint = movement.type === 'IN' ? 'add' : 'remove';
  const url = `${this.baseUrl}/api/inventory/${endpoint}`;
  return this.http.post<any>(url, {
    productId: movement.product,
    warehouseId: movement.warehouse,
    quantity: movement.quantity,
    reason: movement.reason
  });
}

  getStockLevels(): Observable<StockLevel[]> {
            const url = `${this.baseUrl}/api/reports/stockmovement/levels`;
    return this.http.get<StockLevel[]>(url);
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
