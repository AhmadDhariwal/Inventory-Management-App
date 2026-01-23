import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockRuleService {
  private baseUrl = 'http://localhost:3000/api/stockrules';

  constructor(private http: HttpClient) {}

  createOrUpdateStockRule(stockRule: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/upsert`, stockRule);
  }

  getStockRules(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getStockRuleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  updateStockRule(id: string, stockRule: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, stockRule);
  }

  deleteStockRule(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}