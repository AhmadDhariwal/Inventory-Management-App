import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../shared/services/stock.service';

@Component({
  selector: 'app-stock-movement-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './stock-movement-form.component.html',
  styleUrl: './stock-movement-form.component.scss'
})
export class StockMovementFormComponent implements OnInit {
  movement = {
    product: '',
    warehouse: '',
    type: '',
    quantity: 0,
    reason: '',
    reference: ''
  };

  products: any[] = [];
  warehouses: any[] = [];
  loading = false;

  constructor(
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
  }

  loadProducts(): void {
    this.stockService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  loadWarehouses(): void {
    this.stockService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
      },
      error: (err) => console.error('Error loading warehouses:', err)
    });
  }

  onSubmit(): void {
    if (!this.movement.product || !this.movement.warehouse || !this.movement.type || !this.movement.quantity) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;
    this.stockService.createStockMovement(this.movement).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/stock/movements']);
      },
      error: (err) => {
        console.error('Error creating movement:', err);
        alert('Failed to create stock movement');
        this.loading = false;
      }
    });
  }
}
