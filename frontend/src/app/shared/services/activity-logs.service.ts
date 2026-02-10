import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  entityId?: string;
  entityName?: string;
  description?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogResponse {
  success: boolean;
  data: ActivityLog[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LogFilters {
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  targetUserId?: string;
}

export interface LogActivity {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  entityId?: string;
  entityName?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogsService {
  private api = 'http://localhost:3000/api/activitylog';
  private logsSubject = new BehaviorSubject<ActivityLog[]>([]);
  public logs$ = this.logsSubject.asObservable();

  constructor(private http: HttpClient) { }

  getLogs(filters: LogFilters = {}): Observable<ActivityLogResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof LogFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ActivityLogResponse>(`${this.api}`, { params })
      .pipe(
        tap(response => {
          if (response.success) {
            this.logsSubject.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  createLog(activity: LogActivity): Observable<any> {
    return this.http.post(this.api, activity)
      .pipe(catchError(this.handleError));
  }

  getLogStats(): Observable<any> {
    return this.http.get(`${this.api}/stats`)
      .pipe(catchError(this.handleError));
  }

  deleteLog(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  refreshLogs(filters: LogFilters = {}): void {
    this.getLogs(filters).subscribe();
  }

  // Convenience methods for common actions
  logCreate(module: string, entityName: string, entityId?: string): Observable<any> {
    return this.createLog({
      action: 'CREATE',
      module,
      entityName,
      entityId,
      description: `Created ${entityName} in ${module}`
    });
  }

  logUpdate(module: string, entityName: string, entityId?: string): Observable<any> {
    return this.createLog({
      action: 'UPDATE',
      module,
      entityName,
      entityId,
      description: `Updated ${entityName} in ${module}`
    });
  }

  logDelete(module: string, entityName: string, entityId?: string): Observable<any> {
    return this.createLog({
      action: 'DELETE',
      module,
      entityName,
      entityId,
      description: `Deleted ${entityName} from ${module}`
    });
  }

  logLogin(): Observable<any> {
    return this.createLog({
      action: 'LOGIN',
      module: 'Authentication',
      description: 'User logged in'
    });
  }

  logLogout(): Observable<any> {
    return this.createLog({
      action: 'LOGOUT',
      module: 'Authentication',
      description: 'User logged out'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Activity logs service error:', error);
    return throwError(() => new Error(error.error?.message || 'An error occurred'));
  }
}