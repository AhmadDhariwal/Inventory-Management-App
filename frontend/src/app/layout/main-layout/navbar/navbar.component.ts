import { Component, EventEmitter, Output, OnInit, inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { filter, map, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { ProductService } from '../../../shared/services/product.service';
import { OrganizationService, Organization } from '../../../shared/services/organization.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { BarcodeScannerComponent } from '../../../shared/components/barcode-scanner/barcode-scanner.component';
import { NotificationService, AppNotification } from '../../../shared/services/notification.service';

interface SearchSuggestion {
  _id: string;
  name: string;
  sku: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BarcodeScannerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  pageTitle = 'Dashboard';
  searchQuery = '';
  isDarkMode = false;
  showUserMenu = false;
  showSuggestions = false;
  searchSuggestions: SearchSuggestion[] = [];
  notificationCount = 0;
  recentActivityCount = 0;
  showScanner = false;
  showNotifications = false;
  notifications: AppNotification[] = [];
  organization: Organization | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private authservice = inject(AuthService);
  private productService = inject(ProductService);
  private organizationService = inject(OrganizationService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.isDarkMode = this.themeService.getCurrentTheme();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getPageTitle(this.router.url)),
      takeUntil(this.destroy$)
    ).subscribe(title => this.pageTitle = title);

    this.pageTitle = this.getPageTitle(this.router.url);

    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });

    // Setup search suggestions with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.loadSearchSuggestions(query);
    });

    // Load organization data
    this.loadOrganization();

    // Subscribe to notifications
    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.notificationCount = count;
    });

    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  private loadOrganization(): void {
    this.organizationService.getCurrentOrganization().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.organization = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading organization:', err);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserRole(): string {
    return this.authservice.getUserRole() || 'user';
  }

  getCurrentUser() {
    return this.authservice.getCurrentUser();
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentTheme();
    console.log('Dark mode toggled via service:', this.isDarkMode);
  }

  onSearchInput(): void {
    if (this.searchQuery.trim().length > 1) {
      this.searchSubject.next(this.searchQuery.trim());
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
      this.searchSuggestions = [];
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.showSuggestions = false;
      this.showScanner = false;
      const exactMatch = this.searchSuggestions.find(s =>
        s.name.toLowerCase() === this.searchQuery.trim().toLowerCase() ||
        s.sku.toLowerCase() === this.searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        this.router.navigate(['/products/details', exactMatch._id]);
      } else {
        this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
      }
    }
  }

  toggleScanner(): void {
    this.showScanner = !this.showScanner;
  }

  onScanSuccess(result: string): void {
    this.searchQuery = result;
    this.onSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.searchSuggestions = [];
    this.searchInput?.nativeElement.focus();
  }

  private loadSearchSuggestions(query: string): void {
    if (!query || query.length < 2) {
      this.searchSuggestions = [];
      return;
    }

    this.productService.getProducts().subscribe({
      next: (response) => {
        console.log('Search products response:', response);
        // Handle different response formats
        let products = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (response && response.products && Array.isArray(response.products)) {
          products = response.products;
        }

        const filtered = products
          .filter((product: any) =>
            product.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.sku?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map((product: any) => ({
            _id: product._id,
            name: product.name || '',
            sku: product.sku || ''
          }));

        console.log('Filtered suggestions:', filtered);
        this.searchSuggestions = filtered;
      },
      error: (err) => {
        console.error('Error loading search suggestions:', err);
        this.searchSuggestions = [];
      }
    });
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.name;
    this.showSuggestions = false;
    console.log('Navigating to product details:', suggestion._id);
    this.router.navigate(['/products/details', suggestion._id]);
  }

  trackBySuggestion(index: number, suggestion: SearchSuggestion): string {
    return suggestion._id;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showSuggestions = false;
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  closeAllDropdowns(): void {
    this.showUserMenu = false;
    this.showSuggestions = false;
    this.showNotifications = false;
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showUserMenu = false;
      this.showSuggestions = false;
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(notification: AppNotification): void {
    // Handle specific notification navigation if needed
    this.showNotifications = false;
  }

  private getPageTitle(url: string): string {
    if (url === '/' || url === '') return 'Home';
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/products/details')) return 'Product Details';
    if (url.includes('/products/edit')) return 'Edit Product';
    if (url.includes('/products/new')) return 'New Product';
    if (url.includes('/products')) return 'Products';
    if (url.includes('/purchases/details')) return 'Purchase Details';
    if (url.includes('/purchases')) return 'Purchases';
    if (url.includes('/suppliers/details')) return 'Supplier Details';
    if (url.includes('/suppliers')) return 'Suppliers';
    if (url.includes('/stock')) return 'Stock';
    if (url.includes('/reports')) return 'Reports';
    if (url.includes('/settings')) return 'Settings';
    return 'Dashboard';
  }

  onlogout(): void {
    this.authservice.logout();
    this.router.navigate(['/']);
  }
}
