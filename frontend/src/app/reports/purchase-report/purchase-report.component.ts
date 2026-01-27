import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../../shared/services/purchase.service';
import { PurchaseOrder } from '../../shared/models/inventory/purchase-order.model';

interface PurchaseSummary {
  totalOrders: number;
  totalAmount: number;
  activeSuppliers: number;
  totalSuppliers: number;
  avgOrderValue: number;
  ordersChange: number;
  amountChange: number;
}

@Component({
  selector: 'app-purchase-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss']
})
export class PurchaseReportComponent implements OnInit {
  purchases: PurchaseOrder[] = [];
  filteredPurchases: PurchaseOrder[] = [];
  paginatedPurchases: PurchaseOrder[] = [];
  suppliers: Array<{_id: string, name: string}> = [];

  summary: PurchaseSummary = {
    totalOrders: 0,
    totalAmount: 0,
    activeSuppliers: 0,
    totalSuppliers: 0,
    avgOrderValue: 0,
    ordersChange: 0,
    amountChange: 0
  };

  // Filters
  selectedDateRange = 'all';
  selectedStatus = 'all';
  selectedSupplier = 'all';
  searchText = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Loading state
  loading = false;

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {
    this.loadPurchaseData();
  }

  loadPurchaseData(): void {
    this.loading = true;
    this.purchaseService.getPurchaseReport().subscribe({
      next: (response) => {
        this.purchases = response || [];
        this.extractSuppliers();
        this.calculateSummary();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading purchase data:', error);
        this.purchases = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private extractSuppliers(): void {
    const supplierMap = new Map();
    this.purchases.forEach(purchase => {
      if (purchase.supplier) {
        supplierMap.set(purchase.supplier._id, {
          _id: purchase.supplier._id,
          name: purchase.supplier.name
        });
      }
    });
    this.suppliers = Array.from(supplierMap.values());
  }

  private calculateSummary(): void {
    const totalOrders = this.purchases.length;

    const totalAmount = this.purchases.reduce((sum, p) => sum + (p.totalamount ?? 0),0);
    console.log("total amount is ",totalAmount);
    const activeSuppliers = new Set(this.purchases.map(p => p.supplier?._id).filter(Boolean)).size;
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    this.summary = {
      totalOrders,
      totalAmount,
      activeSuppliers,
      totalSuppliers: this.suppliers.length,
      avgOrderValue,
      ordersChange: 0,
      amountChange: 0
    };
  }

  applyFilters(): void {
    let filtered = [...this.purchases];

    // Date range filter
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(p => p.createdAt && new Date(p.createdAt) >= startDate);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status && p.status.toLowerCase() === this.selectedStatus);
    }

    // Supplier filter
    if (this.selectedSupplier !== 'all') {
      filtered = filtered.filter(p => p.supplier && p.supplier._id === this.selectedSupplier);
    }

    // Search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p._id.toLowerCase().includes(searchLower) ||
        (p.supplier && p.supplier.name && p.supplier.name.toLowerCase().includes(searchLower))
      );
    }

    this.filteredPurchases = filtered;
    this.sortData();
    this.updatePagination();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortData();
    this.updatePagination();
  }

  private sortData(): void {
    this.filteredPurchases.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof PurchaseOrder];
      let bValue: any = b[this.sortField as keyof PurchaseOrder];

      if (this.sortField === 'supplier') {
        aValue = a.supplier?.name || '';
        bValue = b.supplier?.name || '';
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPurchases.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPurchases = this.filteredPurchases.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getItemsPreview(items: any[]): string {
    if (!items || items.length === 0) return '';

    const preview = items.slice(0, 2).map(item => item.product?.name || 'Unknown').join(', ');
    return items.length > 2 ? `${preview} +${items.length - 2} more` : preview;
  }

  viewPurchaseDetails(purchase: PurchaseOrder): void {
    console.log('View purchase details:', purchase);
  }

  exportReport(format: 'csv' | 'excel'): void {
    const exportMethod = format === 'csv'
      ? this.purchaseService.exportPurchaseReportCSV()
      : this.purchaseService.exportPurchaseReportExcel();

    exportMethod.subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `purchase-report-${new Date().toISOString().split('T')[0]}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
      }
    });
  }

  refreshData(): void {
    this.loadPurchaseData();
  }

  Math = Math;
}
