import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Warehouse } from '../models/inventory/warehouse.model';
import { ActivityLogsService } from './activity-logs.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private baseUrl = 'http://localhost:3000/api/warehouse';

  constructor(
    private http: HttpClient,
    private activityService: ActivityLogsService
  ) {}

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.baseUrl);
  }

  getWarehouseById(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.baseUrl}/${id}`);
  }

  createWarehouse(warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.baseUrl, warehouse).pipe(
      tap((result: any) => {
        if (result && result.name) {
          this.activityService.logCreate('Warehouses', result.name, result._id).subscribe();
        }
      })
    );
  }

  updateWarehouse(id: string, warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.baseUrl}/${id}`, warehouse).pipe(
      tap((result: any) => {
        if (result && result.name) {
          this.activityService.logUpdate('Warehouses', result.name, result._id).subscribe();
        }
      })
    );
  }

  deleteWarehouse(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.activityService.logDelete('Warehouses', 'Warehouse', id).subscribe();
      })
    );
  }
}
