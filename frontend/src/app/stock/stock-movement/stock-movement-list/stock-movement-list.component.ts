import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../shared/services/stock.service';



@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-movement-list.component.html',
  styleUrl: './stock-movement-list.component.scss'
})
export class StockMovementListComponent implements OnInit{

  movements: any[] = [];
  loading = true;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockService.getStockMovements().subscribe({
      next: (data) => {
        console.log('Stock movements data:', data);
        this.movements = data;
        console.log('Movements array:', this.movements);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movements:', err);
        this.loading = false;
      }
    });
  }
}


