import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OrganizationService } from './organization.service';

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
  private socket: Socket;
  private notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notifications.asObservable();
  
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  private authService = inject(AuthService);
  private orgService = inject(OrganizationService);

  constructor() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      autoConnect: false
    });

    this.setupListeners();
    this.init();
  }

  private init() {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.socket.connect();
        this.joinOrganizationRoom();
      } else {
        this.socket.disconnect();
      }
    });

    this.authService.currentUser$.subscribe(user => {
      if (user && user.organizationId) {
        this.joinOrganizationRoom();
      }
    });
  }

  private joinOrganizationRoom() {
    const orgId = this.authService.getOrganizationId();
    if (orgId && this.socket.connected) {
      this.socket.emit('join', orgId);
      console.log('Joined real-time notification room:', orgId);
    }
  }

  private setupListeners() {
    this.socket.on('notification', (payload: any) => {
      console.log('New real-time notification received:', payload);
      const newNotification: AppNotification = {
        ...payload,
        read: false
      };
      
      const current = this.notifications.value;
      this.notifications.next([newNotification, ...current].slice(0, 50));
      this.unreadCount.next(this.unreadCount.value + 1);
      
      // We could also show a browser notification or a toast here
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.joinOrganizationRoom();
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
