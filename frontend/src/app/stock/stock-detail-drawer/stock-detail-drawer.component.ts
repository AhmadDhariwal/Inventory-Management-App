import { Component, EventEmitter, Input, Output,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stock-detail-drawer',
  standalone: true,
  imports: [CommonModule,RouterLink], // Import CommonModule for ngClass
  templateUrl: './stock-detail-drawer.component.html',
  styleUrl: './stock-detail-drawer.component.scss'
})
export class StockDetailDrawerComponent {
  @Input() stock: any = null; // Define the stock property
  @Output() close = new EventEmitter<void>(); // Define the close EventEmitter

  openDrawer(stock: any) {
    this.stock = stock;
  }

  closeDrawer() {
    this.stock = null;
    this.close.emit(); // Emit the close event
  }
    @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }
}
