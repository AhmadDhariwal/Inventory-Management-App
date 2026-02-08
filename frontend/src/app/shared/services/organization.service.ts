import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Organization {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  subscription?: {
    plan: string;
    status: string;
    startDate?: Date;
    endDate?: Date;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl = 'http://localhost:3000/api/organizations';

  constructor(private http: HttpClient) {}

  // Get current user's organization
  getCurrentOrganization(): Observable<{success: boolean, data: Organization}> {
    return this.http.get<{success: boolean, data: Organization}>(`${this.baseUrl}/current`);
  }

  // Get organization by ID (admin only)
  getOrganization(id: string): Observable<{success: boolean, data: Organization}> {
    return this.http.get<{success: boolean, data: Organization}>(`${this.baseUrl}/${id}`);
  }

  // Update organization (admin only)
  updateOrganization(id: string, data: Partial<Organization>): Observable<{success: boolean, message: string, data: Organization}> {
    return this.http.put<{success: boolean, message: string, data: Organization}>(`${this.baseUrl}/${id}`, data);
  }

  // Get organization statistics (admin only)
  getOrganizationStats(): Observable<{success: boolean, data: OrganizationStats}> {
    return this.http.get<{success: boolean, data: OrganizationStats}>(`${this.baseUrl}/current/stats`);
  }

  // Create organization (for initial setup)
  createOrganization(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    settings?: any;
  }): Observable<{success: boolean, message: string, data: Organization}> {
    return this.http.post<{success: boolean, message: string, data: Organization}>(this.baseUrl, data);
  }
}
