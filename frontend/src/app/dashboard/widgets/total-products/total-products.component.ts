import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-total-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './total-products.component.html',
  styleUrl: './total-products.component.scss'
})
export class TotalProductsComponent {
  @Input() count: number = 0;
}
