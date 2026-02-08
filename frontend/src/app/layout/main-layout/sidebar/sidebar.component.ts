import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Add CommonModule
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Output() close = new EventEmitter<void>();
  private authService = inject(AuthService);

  get userRole(): string {
    return this.authService.getUserRole() || '';
  }

  hasRole(roles: string[]): boolean {
    const role = this.userRole;
    return roles.includes(role);
  }
}
