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
    console.log('Updating stock rule and level:', stock);
    console.log('Stock ID:', stock._id);
    console.log('Reserved Quantity:', stock.reservedQuantity);

    // Update stock rule (min stock and reorder level)
    this.stockRuleService.createOrUpdateStockRule({
      product: this.product._id,
      warehouse: stock.warehouse._id,
      reorderLevel: Number(stock.reorderLevel) || 0,
      minStock: Number(stock.minStock) || 0
    }).subscribe({
      next: (result) => {
        console.log('Stock rule updated successfully:', result);

        // Update stock level (reserved quantity)
        if (stock._id) {
          console.log('Updating stock level with ID:', stock._id);
          console.log('Sending data:', { reservedQuantity: Number(stock.reservedQuantity) || 0 });

          this.productService.updateStockLevel(stock._id, {
            reservedQuantity: Number(stock.reservedQuantity) || 0
          }).subscribe({
            next: (stockResult) => {
              console.log('Stock level updated successfully:', stockResult);
              this.router.navigate(['/products']);
            },
            error: (err) => {
              console.error('Full error object:', err);
              console.error('Error status:', err.status);
              console.error('Error message:', err.message);
              console.error('Error body:', err.error);
              alert('Stock rule updated but failed to update reserved quantity. Check console for details.');
            }
          });
        } else {
          console.log('No stock level ID found, skipping reserved quantity update');
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        console.error('Error updating stock rule:', err);
        alert('Error updating stock rule: ' + (err.error?.error || err.message));
      }
    });
  }
}
