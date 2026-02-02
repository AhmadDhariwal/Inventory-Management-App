import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupplierService } from '../../shared/services/supplier.service';
import { Supplier } from '../../shared/models/inventory/supplier.model';

@Component({
  selector: 'app-supplier-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-details.component.html',
  styleUrl: './supplier-details.component.scss'
})
export class SupplierDetailsComponent implements OnInit {
  supplier: Supplier | null = null;
  loading = false;
  supplierId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    if (this.supplierId) {
      this.loadSupplier(this.supplierId);
    }
  }

  loadSupplier(id: string): void {
    this.loading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.supplier = supplier;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.loading = false;
        this.router.navigate(['/suppliers']);
      }
    });
  }

  editSupplier(): void {
    if (this.supplier) {
      this.router.navigate(['/suppliers/edit', this.supplier._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
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