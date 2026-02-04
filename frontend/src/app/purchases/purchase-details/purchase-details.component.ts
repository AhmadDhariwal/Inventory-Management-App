import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../shared/services/purchase.service';
import { PurchaseOrder } from '../../shared/models/inventory/purchase-order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-details.component.html',
  styleUrl: './purchase-details.component.scss'
})
export class PurchaseDetailsComponent implements OnInit {
  purchaseOrder!: PurchaseOrder;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadPurchaseOrder(orderId);
    } else {
      this.loading = false;
    }
  }

  loadPurchaseOrder(id: string): void {
    this.purchaseService.getPurchaseOrderById(id).subscribe({
      next: (order) => {
        this.purchaseOrder = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading purchase order:', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/purchases']);
  }

  getTotalItems(): number {
    return this.purchaseOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}
