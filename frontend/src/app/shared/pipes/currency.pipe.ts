import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false // Necessary to respond to config changes
})
export class AppCurrencyPipe implements PipeTransform {
  // Simple hardcoded conversion rates (Base: USD)
  private rates: Record<string, number> = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'PKR': 278.5,
    'INR': 83.1,
    'CAD': 1.35,
    'AUD': 1.52,
    'AED': 3.67,
    'SAR': 3.75
  };

  constructor(private configService: ConfigService) {}

  transform(value: number | string | undefined | null): string {
    if (value === null || value === undefined || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return value.toString();

    const targetCurrency = this.configService.currentSettings?.currency || 'USD';
    const rate = this.rates[targetCurrency] || 1.0;
    const convertedValue = numValue * rate;

    const symbol = this.configService.currencySymbol;
    
    // Format based on currency
    return `${symbol}${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
import { Injectable } from '@angular/core';
