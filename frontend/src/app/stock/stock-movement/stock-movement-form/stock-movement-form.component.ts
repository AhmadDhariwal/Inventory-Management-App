import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  movement: any = {
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
  isEditMode = false;
  movementId: string | null = null;

  constructor(
    private stockService: StockService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    
    this.movementId = this.route.snapshot.paramMap.get('id');
    if (this.movementId) {
      this.isEditMode = true;
      this.loadMovementData(this.movementId);
    }
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

  loadMovementData(id: string): void {
    this.stockService.getStockMovements().subscribe({
      next: (movements) => {
        const found = movements.find(m => m._id === id);
        if (found) {
          this.movement = {
            product: found.product?._id,
            warehouse: found.warehouse?._id,
            type: found.type,
            quantity: found.quantity,
            reason: found.reason,
            reference: found.reference
          };
        }
      },
      error: (err) => console.error('Error loading movement:', err)
    });
  }

  onSubmit(): void {
    if (!this.movement.product || !this.movement.warehouse || !this.movement.type || !this.movement.quantity) {
      alert('Please fill all required fields');
      return;
    }

    this.loading = true;
    const obs = this.isEditMode 
      ? this.stockService.updateStockMovement(this.movementId!, this.movement)
      : this.stockService.createStockMovement(this.movement);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/stock/movements']);
      },
      error: (err) => {
        console.error('Error saving movement:', err);
        alert('Failed to save stock movement: ' + (err.error?.error || err.message));
        this.loading = false;
      }
    });
  }
}
