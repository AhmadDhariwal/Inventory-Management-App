import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-low-stock-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-stock-widget.component.html',
  styleUrls: ['./low-stock-widget.component.scss']
})
export class LowStockWidgetComponent {
  @Input() lowStockItems: any[] = [];
  @Input() totalCount: number = 0;
  @Output() itemClick = new EventEmitter<any>();

  isExpanded = false;

  constructor(private router: Router) {}

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  onItemClick(item: any): void {
    this.itemClick.emit(item);
    if (item.productId) {
      this.router.navigate(['/products/details', item.productId]);
    }
  }

  getStockLevel(item: any): string {
    const percentage = (item.availableQty / item.minStock) * 100;
    if (percentage <= 25) return 'critical';
    if (percentage <= 50) return 'low';
    return 'warning';
  }

  trackByItem(index: number, item: any): any {
    return item.productId || item.sku;
  }
}