import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StockService } from '../../../shared/services/stock.service';

@Component({
  selector: 'app-stock-movement-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-movement-detail.component.html',
  styleUrl: './stock-movement-detail.component.scss'
})
export class StockMovementDetailComponent implements OnInit {
  movement: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovement(id);
    }
  }

  loadMovement(id: string): void {
    this.loading = true;
    this.stockService.getStockMovements().subscribe({
      next: (movements) => {
        this.movement = movements.find(m => m._id === id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movement detail:', err);
        this.loading = false;
      }
    });
  }
}
