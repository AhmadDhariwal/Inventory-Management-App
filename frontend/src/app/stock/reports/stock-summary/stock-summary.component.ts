import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../shared/services/stock.service';
import { InventorySummary } from '../../../shared/models/inventory/inventory-summary.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-stock-summary',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './stock-summary.component.html',
  styleUrls: ['./stock-summary.component.scss']
})
export class StockSummaryComponent implements OnInit {

  summary!: InventorySummary;
  loading = true;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockService.getStockSummary().subscribe({
      next: data => {
        this.summary = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
