import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PurchaseService } from '../../shared/services/purchase.service';
import { SupplierService } from '../../shared/services/supplier.service';
import { StockService } from '../../shared/services/stock.service';
import { PurchaseOrder } from '../../shared/models/inventory/purchase-order.model';
import { Supplier } from '../../shared/models/inventory/supplier.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.scss'
})
export class PurchaseListComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  isLoading = false;

  // Delete Modal
  showDeleteModal = false;
  deletePurchaseOrderId = '';
  deletePurchaseOrderName = '';
  isDeleting = false;

  // Search and Filter
  searchTerm = '';
  selectedSupplier = '';

  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;
  showExportDropdown = false;

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadSuppliers();
  }

  loadPurchaseOrders(): void {
    this.isLoading = true;
    this.purchaseService.getPurchaseOrders().subscribe({
      next: (orders) => {
        this.purchaseOrders = orders;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading purchase orders:', err);
        this.isLoading = false;
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.purchaseOrders];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(po =>
        po.supplier?.name?.toLowerCase().includes(term) ||
        po.warehouse?.name?.toLowerCase().includes(term) ||
        po.createdBy?.name?.toLowerCase().includes(term)
      );
    }

    // Apply supplier filter
    if (this.selectedSupplier) {
      filtered = filtered.filter(po => po.supplier?._id === this.selectedSupplier);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'supplier':
          aValue = a.supplier?.name || '';
          bValue = b.supplier?.name || '';
          break;
        case 'warehouse':
          aValue = a.warehouse?.name || '';
          bValue = b.warehouse?.name || '';
          break;
        case 'createdBy':
          aValue = a.createdBy?.name || '';
          bValue = b.createdBy?.name || '';
          break;
        case 'totalamount':
          aValue = a.totalamount || 0;
          bValue = b.totalamount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredPurchaseOrders = filtered.slice(startIndex, endIndex);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortDirection(field: string): string | null {
    if (this.sortField === field) {
      return this.sortDirection === 'asc' ? 'ascending' : 'descending';
    }
    return null;
  }

  generateOrderNumber(index: number): string {
    const orderIndex = (this.currentPage - 1) * this.pageSize + index + 1;
    return orderIndex.toString().padStart(4, '0');
  }

  refreshList(): void {
    this.loadPurchaseOrders();
  }

  viewPurchaseOrder(po: PurchaseOrder): void {
    console.log('Navigating to purchase details:', po._id);
    this.router.navigate(['/purchases/details', po._id]);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  trackByPurchaseOrder(index: number, po: PurchaseOrder): string {
    return po._id;
  }

  trackBySupplier(index: number, supplier: Supplier): string {
    return supplier._id;
  }

  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  exportCSV(): void {
    this.stockService.exportPurchaseOrdersCSV({}).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'purchase-orders.csv');
        this.showExportDropdown = false;
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  exportExcel(): void {
    this.stockService.exportPurchaseOrdersExcel({}).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'purchase-orders.xlsx');
        this.showExportDropdown = false;
      },
      error: (err) => console.error('Export failed:', err)
    });
  }

  printList(): void {
    window.print();
    this.showExportDropdown = false;
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  deletePurchaseOrder(po: PurchaseOrder): void {
    this.deletePurchaseOrderId = po._id;
    this.deletePurchaseOrderName = po.supplier?.name || 'Unknown Supplier';
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    this.isDeleting = true;
    this.purchaseService.deletePurchaseOrder(this.deletePurchaseOrderId).subscribe({
      next: (response) => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        if (response.success) {
          this.loadPurchaseOrders();
        }
      },
      error: (error) => {
        console.error('Error deleting purchase order:', error);
        this.isDeleting = false;
        this.showDeleteModal = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deletePurchaseOrderId = '';
    this.deletePurchaseOrderName = '';
  }

  approvePurchaseOrder(po: PurchaseOrder): void {
    this.purchaseService.approvePurchaseOrder(po._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPurchaseOrders();
        }
      },
      error: (error) => {
        console.error('Error approving purchase order:', error);
      }
    });
  }

  receivePurchaseOrder(po: PurchaseOrder): void {
    this.purchaseService.receivePurchaseOrder(po._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPurchaseOrders();
        }
      },
      error: (error) => {
        console.error('Error receiving purchase order:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'RECEIVED': return 'status-received';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  // Helper methods for safe template access
  getSupplierName(po: PurchaseOrder): string {
    return po.supplier && po.supplier.name ? po.supplier.name : 'N/A';
  }

  getWarehouseName(po: PurchaseOrder): string {
    return po.warehouse && po.warehouse.name ? po.warehouse.name : 'N/A';
  }

  getCreatedByName(po: PurchaseOrder): string {
    // Check if createdBy exists and has a name property (it might be just an ID string if not populated)
    return po.createdBy && (po.createdBy as any).name ? (po.createdBy as any).name : 'Unknown';
  }
}


