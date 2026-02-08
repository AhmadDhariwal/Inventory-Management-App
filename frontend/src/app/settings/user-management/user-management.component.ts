import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserListItem, UserProfile } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { OrganizationService, OrganizationStats } from '../../shared/services/organization.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: UserListItem[] = [];
  managers: UserListItem[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  organizationStats: OrganizationStats | null = null;

  selectedUserId: string = '';
  selectedManagerId: string = '';
  showAssignModal = false;

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);

  ngOnInit() {
    this.loadUsers();
    this.loadOrganizationStats();
  }

  get currentUserRole(): string | null {
    return this.authService.getUserRole();
  }

  get isAdmin(): boolean {
    const role = this.currentUserRole;
    return role ? role.toLowerCase() === 'admin' : false;
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users response:', response);
        
        // Handle different response formats
        if (response.success && response.data) {
          this.users = response.data;
        } else if (Array.isArray(response)) {
          this.users = response;
        } else if (response.users) {
          this.users = response.users;
        }

        // Filter managers for assignment dropdown
        this.managers = this.users.filter(u => u.role === 'manager');
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  loadOrganizationStats(): void {
    this.organizationService.getOrganizationStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.organizationStats = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading organization stats:', err);
      }
    });
  }

  openAssignModal(userId: string): void {
    this.selectedUserId = userId;
    this.selectedManagerId = '';
    this.showAssignModal = true;
    this.error = null;
    this.success = null;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedUserId = '';
    this.selectedManagerId = '';
  }

  assignManager(): void {
    if (!this.selectedUserId || !this.selectedManagerId) {
      this.error = 'Please select a manager';
      return;
    }

    this.loading = true;
    this.error = null;

    this.userService.assignUserToManager(this.selectedUserId, this.selectedManagerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = response.message || 'Manager assigned successfully';
          this.closeAssignModal();
          this.loadUsers(); // Reload users to see updated assignments
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.success = null;
          }, 3000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error assigning manager:', err);
        this.error = err.error?.error || 'Failed to assign manager';
        this.loading = false;
      }
    });
  }

  updateUserRole(userId: string, newRole: 'admin' | 'manager' | 'user'): void {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.userService.updateUserRole({ userId, newRole }).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = response.message || 'Role updated successfully';
          this.loadUsers();
          
          setTimeout(() => {
            this.success = null;
          }, 3000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating role:', err);
        this.error = err.error?.error || 'Failed to update role';
        this.loading = false;
      }
    });
  }

  toggleUserStatus(userId: string): void {
    this.loading = true;
    this.error = null;

    this.userService.toggleUserStatus(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = response.message || 'User status updated';
          this.loadUsers();
          
          setTimeout(() => {
            this.success = null;
          }, 3000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        this.error = err.error?.error || 'Failed to update status';
        this.loading = false;
      }
    });
  }

  getManagerName(managerId: any): string {
    if (!managerId) return 'None';
    
    const managerIdStr = typeof managerId === 'object' ? managerId._id : managerId;
    const manager = this.users.find(u => u._id === managerIdStr);
    return manager ? manager.name : 'Unknown';
  }

  getRoleBadgeClass(role: string): string {
    return `role-badge role-${role}`;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-badge status-active' : 'status-badge status-inactive';
  }

  // Add User Logic
  showAddUserModal = false;
  newUser = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'user',
    department: '',
    phone: '',
    organizationName: '' // Not used for internal creation but needed for type compatibility if strictly typed
  };

  openAddUserModal(): void {
    this.newUser = {
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'user', // Default to user
      department: '',
      phone: '',
      organizationName: ''
    };
    this.showAddUserModal = true;
    this.error = null;
    this.success = null;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  createUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.username || !this.newUser.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    // Use UserService to create user. This calls /api/user/create which is protected and uses the admin's organizationId
    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'User created successfully';
          this.closeAddUserModal();
          this.loadUsers();
          this.loadOrganizationStats(); // Refresh stats
          
          setTimeout(() => {
            this.success = null;
          }, 3000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.error = err.error?.message || err.error?.error || 'Failed to create user';
        this.loading = false;
      }
    });
  }
}
