import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-purchases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-purchases.component.html',
  styleUrl: './pending-purchases.component.scss'
})
export class PendingPurchasesComponent {
  @Input() count: number = 0;
  @Input() approvedCount: number = 0;
}
