import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OrganizationService } from './organization.service';
import { SocketService } from './socket.service';

export interface AppNotification {
  type: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notifications.asObservable();
  
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  constructor(private socketService: SocketService) {
    this.setupListeners();
  }

  private setupListeners() {
    this.socketService.listen<AppNotification>('notification').subscribe((payload: AppNotification) => {
      console.log('New real-time notification received:', payload);
      const newNotification: AppNotification = {
        ...payload,
        read: false
      };
      
      const current = this.notifications.value;
      this.notifications.next([newNotification, ...current].slice(0, 50));
      this.unreadCount.next(this.unreadCount.value + 1);
    });
  }

  markAllAsRead() {
    const current = this.notifications.value.map(n => ({ ...n, read: true }));
    this.notifications.next(current);
    this.unreadCount.next(0);
  }

  getNotifications(): AppNotification[] {
    return this.notifications.value;
  }
}
