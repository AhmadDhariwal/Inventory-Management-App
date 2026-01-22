import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { Router } from '@angular/router';
import { Product } from '../../shared/models/inventory/product.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmModalComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  stockLevels: any[] = [];
  isLoading = false;

  // Search and Filter
  searchTerm = '';
  selectedCategory = '';

  // Sorting
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal state
  showDeleteModal = false;
  deleteProductId = '';
  deleteProductName = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadStockLevels();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    //console.log('Loading categories...');
    this.productService.getCategories().subscribe({
      next: (data) => {
    //    console.log('Categories loaded:', data);
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadStockLevels(): void {
    this.productService.getStockLevels().subscribe({
      next: (data) => {
        this.stockLevels = data;
      },
      error: (err) => {
        console.error('Error loading stock levels:', err);
      }
    });
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  onFilter(): void {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.category?.name?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category?._id === this.selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'category':
          aValue = a.category?.name || '';
          bValue = b.category?.name || '';
          break;
        case 'cost':
        case 'price':
          aValue = a[this.sortField as keyof Product] || 0;
          bValue = b[this.sortField as keyof Product] || 0;
          break;
        default:
          aValue = a[this.sortField as keyof Product] || '';
          bValue = b[this.sortField as keyof Product] || '';
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredProducts = filtered;
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

  refreshList(): void {
    this.loadProducts();
    this.loadStockLevels();
  }

  addProduct(): void {
    this.router.navigate(['/products/new']);
  }

  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(id: string, name: string): void {
    this.deleteProductId = id;
    this.deleteProductName = name;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    this.productService.deleteProduct(this.deleteProductId).subscribe({
      next: () => {
        this.loadProducts();
        this.showDeleteModal = false;
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.showDeleteModal = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteProductId = '';
    this.deleteProductName = '';
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }

  trackByCategory(index: number, category: any): string {
    return category._id;
  }

  getDeleteMessage(): string {
    return `Are you sure you want to delete "${this.deleteProductName}"? This action cannot be undone.`;
  }

  getProductStockLevel(productId: string): number {
    const stockLevel = this.stockLevels.find(sl => sl.product?._id === productId);
    return stockLevel ? stockLevel.quantity : 0;
  }

  viewProduct(id: string) {
    this.router.navigate(['/products/details', id]);
  }

}


