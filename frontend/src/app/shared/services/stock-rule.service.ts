import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StockRule, StockRuleResponse, StockLevelCheck } from '../models/inventory/stock-rule.model';

@Injectable({ 
  providedIn: 'root' 
})
export class StockRuleService {
  private baseUrl = 'http://localhost:3000/api/stockrules';
  private stockRulesSubject = new BehaviorSubject<StockRule | null>(null);
  public stockRules$ = this.stockRulesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get current stock rules
  getRules(): Observable<StockRule> {
    return this.http.get<StockRuleResponse>(this.baseUrl).pipe(
      map(response => response.data),
      tap(rules => this.stockRulesSubject.next(rules))
    );
  }

  // Update stock rules
  updateRules(data: Partial<StockRule>): Observable<StockRule> {
    return this.http.put<StockRuleResponse>(this.baseUrl, data).pipe(
      map(response => response.data),
      tap(rules => this.stockRulesSubject.next(rules))
    );
  }

  // Create or update individual stock rule for product/warehouse
  createOrUpdateStockRule(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/product-rule`, data);
  }

  // Check stock level against rules
  checkStockLevel(quantity: number): Observable<StockLevelCheck> {
    return this.http.get<{success: boolean, data: StockLevelCheck}>(`${this.baseUrl}/check-stock/${quantity}`).pipe(
      map(response => response.data)
    );
  }

  // Get default warehouse
  getDefaultWarehouse(): Observable<any> {
    return this.http.get<{success: boolean, data: any}>(`${this.baseUrl}/default-warehouse`).pipe(
      map(response => response.data)
    );
  }

  // Get current rules from cache
  getCurrentRules(): StockRule | null {
    return this.stockRulesSubject.value;
  }

  // Check if negative stock is allowed
  isNegativeStockAllowed(): boolean {
    const rules = this.getCurrentRules();
    return rules ? rules.allowNegativeStock : false;
  }

  // Get low stock threshold
  getLowStockThreshold(): number {
    const rules = this.getCurrentRules();
    return rules ? rules.lowStockThreshold : 10;
  }
}