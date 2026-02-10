import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket;
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket']
    });

    this.setupBaseListeners();
    this.handleAuthChanges();
  }

  private setupBaseListeners(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected$.next(true);
      this.joinOrganizationRoom();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected$.next(false);
    });
  }

  private handleAuthChanges(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.socket.connect();
      } else {
        this.socket.disconnect();
      }
    });

    this.authService.currentUser$.subscribe(user => {
      if (user && user.organizationId && this.socket.connected) {
        this.joinOrganizationRoom();
      }
    });
  }

  private joinOrganizationRoom(): void {
    const orgId = this.authService.getOrganizationId();
    if (orgId && this.socket.connected) {
      this.socket.emit('join', orgId);
      console.log('Joined organization room:', orgId);
    }
  }

  public listen<T>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });
      return () => this.socket.off(eventName);
    });
  }

  public emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
