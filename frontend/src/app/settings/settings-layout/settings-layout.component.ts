import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, CommonModule, ConfirmModalComponent],
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss'
})
export class SettingsLayoutComponent {
  showRestrictionModal = false;
  restrictionFeature = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  getUserRole(): string {
    return this.authService.getUserRole() || 'user';
  }

  onRestrictedAccess(feature: string): void {
    this.restrictionFeature = feature;
    this.showRestrictionModal = true;
  }

  closeRestrictionModal(): void {
    this.showRestrictionModal = false;
  }
}
