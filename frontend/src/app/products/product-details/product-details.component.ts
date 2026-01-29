import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { StockRuleService } from '../../shared/services/stock-rule.service';
import { Product } from '../../shared/models/inventory/product.model';
import { ProductStockRuleRequest } from '../../shared/models/inventory/product-stock-rule.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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
  updating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private stockRuleService: StockRuleService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
      this.loadStockLevels(productId);
    }
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (err) => {
        const sanitizedError = String(err.message || 'Unknown error').replace(/[\r\n\t]/g, ' ');
        console.error('Error loading product:', sanitizedError);
        this.loading = false;
      }
    });
  }

  loadStockLevels(productId: string): void {
    this.productService.getStockLevels(productId).subscribe({
      next: (stockLevels) => {
        this.stockLevels = stockLevels;
        this.totalStock = stockLevels.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);
        this.loading = false;
        // Load existing stock rules for each stock level
        this.loadExistingStockRules();
      },
      error: (err) => {
        const sanitizedError = String(err.message || 'Unknown error').replace(/[\r\n\t]/g, ' ');
        console.error('Error loading stock levels:', sanitizedError);
        this.loading = false;
      }
    });
  }

  loadExistingStockRules(): void {
    this.stockLevels.forEach(stock => {
      if (stock.product && stock.warehouse) {
        this.stockRuleService.getProductStockRule(stock.product._id, stock.warehouse._id).subscribe({
          next: (rule) => {
            stock.reorderLevel = rule.reorderLevel;
            stock.minStock = rule.minStock;
          },
          error: () => {
            // Rule doesn't exist, use defaults
            stock.reorderLevel = stock.reorderLevel || 0;
            stock.minStock = stock.minStock || 0;
          }
        });
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
    if (this.updating) return;

    this.updating = true;
    const updates = [];

    // Update stock rule (min stock and reorder level)
    if (this.product && stock.warehouse) {
      const stockRuleData: ProductStockRuleRequest = {
        product: this.product._id,
        warehouse: stock.warehouse._id,
        reorderLevel: Number(stock.reorderLevel) || 0,
        minStock: Number(stock.minStock) || 0
      };
      const stockRuleUpdate = this.stockRuleService.createOrUpdateStockRule(stockRuleData);
      updates.push(stockRuleUpdate);
    }

    // Update stock level (reserved quantity)
    if (stock._id) {
      const stockLevelUpdate = this.productService.updateStockLevel(stock._id, {
         reservedQuantity: Number(stock.reservedQuantity) || 0,
        minStock : Number(stock.minStock) || 0,
        reorderLevel: Number(stock.reorderLevel) || 0
      });
      updates.push(stockLevelUpdate);
    }

    if (updates.length > 0) {
      forkJoin(updates).subscribe({
        next: (results) => {
          console.log('Stock updates completed successfully');
          this.updating = false;
          // Reload stock levels to reflect changes
          if (this.product) {
            this.loadStockLevels(this.product._id);
          }
        },
        error: (err) => {
          const sanitizedError = String(err.error?.error || err.message || 'Unknown error').replace(/[\r\n\t]/g, ' ');
          console.error('Error updating stock:', sanitizedError);
          alert('Error updating stock: ' + sanitizedError);
          this.updating = false;
        }
      });
    } else {
      this.updating = false;
      alert('No valid data to update');
    }
  }
}

