import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StockDetailDrawerComponent } from '../stock-detail-drawer/stock-detail-drawer.component';

interface StockLevel {
  sku: string;
  productName: string;
  category: string;
  warehouse: string;
  availableQty: number;
  reservedQty: number;
  reorderLevel: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

@Component({
  selector: 'app-stock-levels',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, StockDetailDrawerComponent],
  templateUrl: './stock-levels.component.html',
  styleUrl: './stock-levels.component.scss'
})

export class StockLevelsComponent implements OnInit {

  searchText = '';
  selectedWarehouse = 'ALL';

  warehouses = ['ALL', 'Karachi WH', 'Lahore WH'];

  stockLevels: StockLevel[] = [];

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData() {
    this.stockLevels = [
      {
        sku: 'SKU-001',
        productName: 'Wireless Mouse',
        category: 'Electronics',
        warehouse: 'Karachi WH',
        availableQty: 120,
        reservedQty: 20,
        reorderLevel: 50,
        status: 'OK'
      },
      {
        sku: 'SKU-002',
        productName: 'Mechanical Keyboard',
        category: 'Electronics',
        warehouse: 'Lahore WH',
        availableQty: 30,
        reservedQty: 10,
        reorderLevel: 40,
        status: 'LOW'
      },
      {
        sku: 'SKU-003',
        productName: 'USB-C Cable',
        category: 'Accessories',
        warehouse: 'Karachi WH',
        availableQty: 8,
        reservedQty: 5,
        reorderLevel: 20,
        status: 'CRITICAL'
      }
    ];
  }

  filteredStock() {
    return this.stockLevels.filter(item =>
      (this.selectedWarehouse === 'ALL' || item.warehouse === this.selectedWarehouse) &&
      (item.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
       item.sku.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }
  selectedStock: any = null;

openDrawer(stock: any) {
  this.selectedStock = stock;
}

closeDrawer() {
  this.selectedStock = null;
}

}
