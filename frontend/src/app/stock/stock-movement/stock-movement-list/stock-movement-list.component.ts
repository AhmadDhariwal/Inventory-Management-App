import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../shared/services/stock.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  templateUrl: './stock-movement-list.component.html',
  styleUrl: './stock-movement-list.component.scss'
})
export class StockMovementListComponent implements OnInit {
  movements: any[] = [];
  filteredMovements: any[] = [];
  loading = true;

  // Filters
  searchTerm = '';
  typeFilter = 'ALL';

  // Modal state
  showDeleteModal = false;
  deleteMovementId = '';

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.stockService.getStockMovements().subscribe({
      next: (data) => {
        this.movements = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading movements:', err);
        this.loading = false;
      }
    });
  }

  onFilterChange(type: string): void {
    this.typeFilter = type;
    this.applyFilters();
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredMovements = this.movements.filter(m => {
      const matchesType = this.typeFilter === 'ALL' || m.type === this.typeFilter;
      const matchesSearch = !this.searchTerm || 
        m.product?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.warehouse?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  onDelete(id: string): void {
    this.deleteMovementId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.deleteMovementId) return;

    this.stockService.deleteStockMovement(this.deleteMovementId).subscribe({
      next: () => {
        this.loadMovements();
        this.showDeleteModal = false;
        this.deleteMovementId = '';
      },
      error: (err) => {
        console.error('Error deleting movement:', err);
        alert('Failed to delete movement: ' + (err.error?.error || err.message));
        this.showDeleteModal = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteMovementId = '';
  }

  getDeleteMessage(): string {
    return 'Are you sure you want to delete this movement record? This will reverse the stock adjustment associated with it.';
  }
}


