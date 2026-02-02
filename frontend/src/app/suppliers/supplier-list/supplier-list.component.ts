import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../shared/services/supplier.service';
import { Supplier } from '../../shared/models/inventory/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = false;
  searchTerm = '';
  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;

  constructor(
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.filteredSuppliers = suppliers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.loading = false;
      }
    });
  }

  filterSuppliers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = this.suppliers;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term) ||
      supplier.contactperson?.toLowerCase().includes(term)
    );
  }

  addSupplier(): void {
    this.router.navigate(['/suppliers/add']);
  }

  editSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers/edit', supplier._id]);
  }

  viewSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers/details', supplier._id]);
  }

  trackBySupplier(index: number, supplier: Supplier): string {
    return supplier._id;
  }

  confirmDelete(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.supplierToDelete = null;
  }

  deleteSupplier(): void {
    if (!this.supplierToDelete) return;

    this.supplierService.deleteSupplier(this.supplierToDelete._id).subscribe({
      next: () => {
        this.loadSuppliers();
        this.cancelDelete();
      },
      error: (error) => {
        console.error('Error deleting supplier:', error);
        this.cancelDelete();
      }
    });
  }

  toggleSupplierStatus(supplier: Supplier): void {
    this.supplierService.toggleSupplierStatus(supplier._id).subscribe({
      next: () => {
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error toggling supplier status:', error);
      }
    });
  }

  getPaymentTermsLabel(terms: string): string {
    const labels: { [key: string]: string } = {
      'CASH': 'Cash',
      'NET_15': 'Net 15 Days',
      'NET_30': 'Net 30 Days',
      'NET_60': 'Net 60 Days'
    };
    return labels[terms] || terms;
  }
}
