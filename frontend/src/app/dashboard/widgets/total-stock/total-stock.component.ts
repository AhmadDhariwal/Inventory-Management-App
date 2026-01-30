import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-total-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './total-stock.component.html',
  styleUrl: './total-stock.component.scss'
})
export class TotalStockComponent {
  @Input() quantity: number = 0;
}
