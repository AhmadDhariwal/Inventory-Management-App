import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-today.component.html',
  styleUrl: './stock-today.component.scss'
})
export class StockTodayComponent {
  @Input() stockIn: number = 0;
  @Input() stockOut: number = 0;
}
