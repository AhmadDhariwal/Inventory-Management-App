import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService, User } from './auth.service';
import { SocketService } from './socket.service';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  createdAt: Date;
  read: boolean;
}

export interface PaginatedNotifications {
  success: boolean;
  notifications: AppNotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `http://localhost:3000/api/notifications`;
  private notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notifications.asObservable();
  
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);
  private socketService = inject(SocketService);

  constructor() {
    this.setupListeners();
    this.loadInitialNotifications();
  }

  private setupListeners() {
    this.socketService.listen<AppNotification>('notification').subscribe((payload: AppNotification) => {
      console.log('New real-time notification received:', payload);
      const current = this.notifications.value;
      this.notifications.next([payload, ...current].slice(0, 50));
      this.unreadCount.next(this.unreadCount.value + 1);
    });
  }

  loadInitialNotifications() {
    this.getNotifications(1, 10).subscribe(response => {
      if (response.success) {
        this.notifications.next(response.notifications);
        this.unreadCount.next(response.unreadCount);
      }
    });
  }

  getNotifications(page: number = 1, limit: number = 10): Observable<PaginatedNotifications> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.httpClient.get<PaginatedNotifications>(this.apiUrl, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      map((response: any) => {
        const current = this.notifications.value.map(n => 
          n._id === id ? { ...n, read: true } : n
        );
        this.notifications.next(current);
        const unread = Math.max(0, this.unreadCount.value - 1);
        this.unreadCount.next(unread);
        return response;
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/mark-all-read`, {}).pipe(
      map((response: any) => {
        const current = this.notifications.value.map(n => ({ ...n, read: true }));
        this.notifications.next(current);
        this.unreadCount.next(0);
        return response;
      })
    );
  }

  deleteNotification(id: string): Observable<any> {
    const wasUnread = this.notifications.value.find(n => n._id === id)?.read === false;
    
    return this.httpClient.delete(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        const current = this.notifications.value.filter(n => n._id !== id);
        this.notifications.next(current);
        if (wasUnread) {
          const unread = Math.max(0, this.unreadCount.value - 1);
          this.unreadCount.next(unread);
        }
        return response;
      })
    );
  }

  clearAll(): Observable<any> {
    return this.httpClient.delete(this.apiUrl).pipe(
      map((response: any) => {
        this.notifications.next([]);
        this.unreadCount.next(0);
        return response;
      })
    );
  }
}

