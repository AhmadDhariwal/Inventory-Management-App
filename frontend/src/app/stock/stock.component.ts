import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent {
  constructor(public router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
