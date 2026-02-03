import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
  features = [
    {
      icon: 'fas fa-boxes',
      title: 'Inventory Management',
      description: 'Track stock levels, manage products, and automate reordering with real-time updates.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Analytics & Reports',
      description: 'Get insights with comprehensive reports on sales, purchases, and stock movements.'
    },
    {
      icon: 'fas fa-users',
      title: 'Supplier Management',
      description: 'Manage supplier relationships, track purchase orders, and streamline procurement.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Multi-Platform Access',
      description: 'Access your inventory from anywhere with our responsive web application.'
    }
  ];

  stats = [
    { number: '10K+', label: 'Products Managed' },
    { number: '500+', label: 'Happy Businesses' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Redirect to dashboard if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/dashboard']);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
