import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { StockRuleService } from '../../shared/services/stock-rule.service';
import { Product } from '../../shared/models/inventory/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product!: Product;
  stockLevels: any[] = [];
  totalStock = 0;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private stockRuleService: StockRuleService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id')!;
    this.loadProduct(productId);
    this.loadStockLevels(productId);
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
      }
    });
  }

  loadStockLevels(productId: string): void {
    this.productService.getStockLevels(productId).subscribe({
      next: (stockLevels) => {
        console.log('Stock levels for product:', stockLevels);
        this.stockLevels = stockLevels;
        this.totalStock = stockLevels.reduce((sum, s) => sum + (s.quantity || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stock levels:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStockStatus(stock: any): string {
    const quantity = stock.quantity || 0;
    const reorderLevel = stock.reorderLevel || 0;
    const minStock = stock.minStock || 0;
    
    if (quantity <= minStock) return 'critical';
    if (quantity <= reorderLevel) return 'low';
    return 'ok';
  }

  getStockStatusText(stock: any): string {
    const status = this.getStockStatus(stock);
    switch (status) {
      case 'critical': return 'Critical';
      case 'low': return 'Low Stock';
      default: return 'OK';
    }
  }

  updateStockRule(stock: any): void {
    console.log('Updating stock rule:', stock);
    
    this.stockRuleService.createOrUpdateStockRule({
      product: this.product._id,
      warehouse: stock.warehouse._id,
      reorderLevel: Number(stock.reorderLevel) || 0,
      minStock: Number(stock.minStock) || 0
    }).subscribe({
      next: (result) => {
        console.log('Stock rule updated successfully:', result);
        alert('Stock rule updated successfully!');
      },
      error: (err) => {
        console.error('Error updating stock rule:', err);
        alert('Error updating stock rule: ' + err.error?.error);
      }
    });
  }
}
