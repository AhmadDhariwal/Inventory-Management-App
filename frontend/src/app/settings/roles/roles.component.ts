import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService, UserListItem, RoleUpdateRequest } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit, OnDestroy {
  users: UserListItem[] = [];
  filteredUsers: UserListItem[] = [];
  loading = false;
  error = '';
  success = '';
  searchTerm = '';
  selectedRole = '';

  // Modal state
  showRoleModal = false;
  selectedUser: UserListItem | null = null;
  newRole: 'admin' | 'manager' | 'user' = 'user';

  // Confirmation modal
  showDeleteModal = false;
  userToDelete: UserListItem | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Full API response:', response);
          console.log('Response type:', typeof response);
          console.log('Is array?', Array.isArray(response));

          let userData: any[] = [];

          // Handle different response formats
          if (Array.isArray(response)) {
            // Direct array response
            userData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            // {success: true, data: []} format
            userData = response.data;
          } else if (response && Array.isArray(response.items)) {
            // {message: '', items: []} format
            userData = response.items;
          } else {
            console.error('Unexpected response format:', response);
            this.error = 'Unexpected response format from server';
            this.loading = false;
            return;
          }

          console.log('User data to process:', userData);

          this.users = userData.map(user => ({
            _id: user._id || user.id,
            name: user.name || 'Unknown',
            email: user.email || '',
            username: user.username || '',
            role: user.role || 'user',
            department: user.department || '',
            isActive: user.isActive || false,
            createdAt: user.createdAt || new Date().toISOString(),
            lastLogin: user.lastLogin || ''
          }));

          console.log('Processed users:', this.users);
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.error = err?.error?.message || 'Failed to load users';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleFilter(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.applyFilters();
  }

  openRoleModal(user: UserListItem): void {
    this.selectedUser = user;
    this.newRole = user.role as 'admin' | 'manager' | 'user';
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
    this.newRole = 'user';
  }

  updateUserRole(): void {
    if (!this.selectedUser) return;

    const roleData: RoleUpdateRequest = {
      userId: this.selectedUser._id,
      newRole: this.newRole
    };

    this.loading = true;
    this.error = '';

    this.userService.updateUserRole(roleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = `User role updated successfully to ${this.newRole}`;
          this.loadUsers();
          this.closeRoleModal();
          this.loading = false;

          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to update user role';
          this.loading = false;
          console.error('Error updating role:', err);
        }
      });
  }

  toggleUserStatus(user: UserListItem): void {
    this.loading = true;
    this.error = '';

    this.userService.toggleUserStatus(user._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = `User ${user.isActive ? 'deactivated' : 'activated'} successfully`;
          this.loadUsers();
          this.loading = false;

          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to update user status';
          this.loading = false;
          console.error('Error updating status:', err);
        }
      });
  }

  openDeleteModal(user: UserListItem): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    this.loading = true;
    this.error = '';

    this.userService.deleteUser(this.userToDelete._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = 'User deleted successfully';
          this.loadUsers();
          this.closeDeleteModal();
          this.loading = false;

          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to delete user';
          this.loading = false;
          console.error('Error deleting user:', err);
        }
      });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'manager': return 'role-manager';
      case 'user': return 'role-user';
      default: return 'role-user';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  canModifyUser(user: UserListItem): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?._id !== user._id; // Can't modify own account
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByUser(index: number, user: UserListItem): string {
    return user._id;
  }
}
