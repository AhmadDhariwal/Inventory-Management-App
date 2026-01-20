import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  pageTitle = 'Dashboard';
  private authservice = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getPageTitle(this.router.url))
    ).subscribe(title => this.pageTitle = title);

    this.pageTitle = this.getPageTitle(this.router.url);
  }

  private getPageTitle(url: string): string {
    if (url === '/' || url === '') return 'Home';
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/products')) return 'Products';
    if (url.includes('/purchases')) return 'Purchases';
    if (url.includes('/stock')) return 'Stock';
    if (url.includes('/reports')) return 'Reports';
    if (url.includes('/settings')) return 'Settings';
    if (url.includes('/suppliers')) return 'Suppliers';
    return 'Home';
  }
  onlogout(){
    this.authservice.logout();
    console.log("Logout function worked")
  }
}
