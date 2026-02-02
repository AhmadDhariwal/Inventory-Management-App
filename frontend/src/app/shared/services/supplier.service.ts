import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Supplier } from '../models/inventory/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = 'http://localhost:3000/api/suppliers';

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<{success: boolean, data: Supplier[]}>(`${this.baseUrl}`)
      .pipe(map(response => response.data));
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<{success: boolean, data: Supplier}>(`${this.baseUrl}`, supplier)
      .pipe(map(response => response.data));
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}`, supplier)
      .pipe(map(response => response.data));
  }

  deleteSupplier(id: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/${id}`);
  }

  disableSupplier(id: string): Observable<Supplier> {
    return this.http.patch<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}/disable`, {})
      .pipe(map(response => response.data));
  }

  toggleSupplierStatus(id: string): Observable<Supplier> {
    return this.http.patch<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}/toggle-status`, {})
      .pipe(map(response => response.data));
  }
}
