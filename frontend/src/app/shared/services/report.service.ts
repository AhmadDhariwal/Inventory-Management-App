import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/inventory/product.model';
import { Category } from '../models/inventory/category.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = 'http://localhost:3000/api/reports';


  constructor(private http: HttpClient) {}


    getproductstockreport(category?: string) {
    const params = new HttpParams().set('category', category || 'ALL');
    return this.http.get<any[]>(`${this.baseUrl}/productreport`, { params });
  }

   getPurchaseReport(from?: string, to?: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/purchasereports?from=${from}&to=${to}`
    );
  }
}
