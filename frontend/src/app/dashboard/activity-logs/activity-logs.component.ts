import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { 
  ActivityLogsService, 
  ActivityLog, 
  ActivityLogResponse, 
  LogFilters 
} from '../../shared/services/activity-logs.service';
import { UserService, UserListItem } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    ConfirmModalComponent
  ],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  logs: ActivityLog[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Table columns
  displayedColumns: string[] = ['user', 'action', 'module', 'entityName', 'description', 'createdAt', 'actions'];
  
  // Filter options
  actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'RECEIVE', 'DISPATCH'];
  moduleOptions: string[] = [];
  userOptions: UserListItem[] = [];
  isAdmin = false;
  
  // Deletion
  showDeleteModal = false;
  logToDeleteId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private activityLogsService: ActivityLogsService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.hasRole('admin');
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadLogs();
    this.loadModuleOptions();
    if (this.isAdmin) {
      this.loadUserOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      action: [''],
      module: [''],
      startDate: [''],
      endDate: [''],
      targetUserId: ['']
    });
  }

  private setupFormSubscriptions(): void {
    // Debounce search input
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadLogs();
      });

    // Other filters
    ['action', 'module', 'startDate', 'endDate', 'targetUserId'].forEach(field => {
      this.filterForm.get(field)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.currentPage = 0;
          this.loadLogs();
        });
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;
    
    const filters: LogFilters = {
      ...this.filterForm.value,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    // Format dates
    if (filters.startDate) {
      filters.startDate = new Date(filters.startDate).toISOString();
    }
    if (filters.endDate) {
      filters.endDate = new Date(filters.endDate).toISOString();
    }

    this.activityLogsService.getLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ActivityLogResponse) => {
          this.logs = response.data;
          this.totalItems = response.pagination.total;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.showError('Failed to load activity logs');
        }
      });
  }

  private loadModuleOptions(): void {
    this.activityLogsService.getLogStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.moduleOptions = response.data.moduleStats.map((stat: any) => stat._id);
          }
        },
        error: (error) => {
          console.error('Failed to load module options:', error);
        }
      });
  }

  private loadUserOptions(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.userOptions = response.data;
          }
        },
        error: (error) => {
          console.error('Failed to load user options:', error);
        }
      });
  }

  deleteLog(id: string): void {
    this.logToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.logToDeleteId) return;

    this.loading = true;
    this.showDeleteModal = false;
    
    this.activityLogsService.deleteLog(this.logToDeleteId)
      .subscribe({
        next: () => {
          this.showSuccess('Activity log deleted');
          this.loadLogs();
          this.logToDeleteId = null;
        },
        error: (err) => {
          this.showError(err.message || 'Failed to delete activity log');
          this.loading = false;
          this.logToDeleteId = null;
        }
      });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.logToDeleteId = null;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadLogs();
  }

  refreshLogs(): void {
    this.loadLogs();
    this.showSuccess('Activity logs refreshed');
  }

  getActionChipColor(action: string): string {
    const colors: { [key: string]: string } = {
      'CREATE': 'primary',
      'UPDATE': 'accent',
      'DELETE': 'warn',
      'LOGIN': 'primary',
      'LOGOUT': 'basic',
      'APPROVE': 'success',
      'REJECT': 'warn',
      'RECEIVE': 'primary',
      'DISPATCH': 'accent'
    };
    return colors[action] || 'basic';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
