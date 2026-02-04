import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Supplier } from '../models/inventory/supplier.model';
import { ActivityLogsService } from './activity-logs.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = 'http://localhost:3000/api/suppliers';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

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
      .pipe(
        map(response => response.data),
        tap((result: Supplier) => {
          this.activityService.logCreate('Suppliers', result.name, result._id).subscribe();
        })
      );
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}`, supplier)
      .pipe(
        map(response => response.data),
        tap((result: Supplier) => {
          this.activityService.logUpdate('Suppliers', result.name, result._id).subscribe();
        })
      );
  }

  deleteSupplier(id: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.activityService.logDelete('Suppliers', 'Supplier', id).subscribe();
      })
    );
  }

  disableSupplier(id: string): Observable<Supplier> {
    return this.http.patch<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}/disable`, {})
      .pipe(
        map(response => response.data),
        tap((result: Supplier) => {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Suppliers',
            entityId: result._id,
            entityName: result.name,
            description: 'Supplier disabled'
          }).subscribe();
        })
      );
  }

  toggleSupplierStatus(id: string): Observable<Supplier> {
    return this.http.patch<{success: boolean, data: Supplier}>(`${this.baseUrl}/${id}/toggle-status`, {})
      .pipe(
        map(response => response.data),
        tap((result: Supplier) => {
          this.activityService.createLog({
            action: 'UPDATE',
            module: 'Suppliers',
            entityId: result._id,
            entityName: result.name,
            description: 'Supplier status toggled'
          }).subscribe();
        })
      );
  }
}
