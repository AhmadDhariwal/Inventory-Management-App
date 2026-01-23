import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../shared/services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-report.component.html',
  styleUrl: './product-report.component.scss'
})
export class ProductReportComponent implements OnInit {
  report: any[] = [];
  filteredReport: any[] = [];
  categories: string[] = ['ALL'];
  warehouses: string[] = ['ALL'];

  selectedCategory = 'ALL';
  selectedWarehouse = 'ALL';
  searchTerm = '';
  isLoading = false;

  constructor(private reportservice: ReportService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    // Load all products first (don't filter by category on backend)
    this.reportservice.getproductstockreport('ALL')
      .subscribe({
        next: (data) => {
          console.log('Product report data:', data);
          this.report = data || [];
          this.extractFilters();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading product report:', err);
          this.isLoading = false;
        }
      });
  }

  extractFilters(): void {
    console.log('Extracting filters from report:', this.report);
    const categorySet = new Set<string>();
    const warehouseSet = new Set<string>();

    this.report.forEach(item => {
      console.log('Processing item:', item);
      if (item.category && item.category !== 'N/A') categorySet.add(item.category);
      if (item.warehouse && item.warehouse !== 'N/A') warehouseSet.add(item.warehouse);
    });

    this.categories = ['ALL', ...Array.from(categorySet)];
    this.warehouses = ['ALL', ...Array.from(warehouseSet)];
    
    console.log('Extracted categories:', this.categories);
    console.log('Extracted warehouses:', this.warehouses);
  }

  applyFilters(): void {
    let filtered = [...this.report];

    // Apply category filter
    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Apply warehouse filter
    if (this.selectedWarehouse !== 'ALL') {
      filtered = filtered.filter(item => item.warehouse === this.selectedWarehouse);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.product?.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term)
      );
    }

    this.filteredReport = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  exportCSV(): void {
    const csvHeader = 'SKU,Product,Category,Warehouse,Quantity\n';
    const csvRows = this.filteredReport.map(item =>
      `${item.sku},${item.product},${item.category},${item.warehouse},${item.quantity}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }

  trackByItem(index: number, item: any): string {
    return item.sku || index.toString();
  }
}

