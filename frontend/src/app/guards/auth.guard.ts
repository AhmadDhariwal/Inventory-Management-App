import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Check for role-based access if specified in route data
          const requiredRoles = route.data?.['roles'] as string[];
          if (requiredRoles && requiredRoles.length > 0) {
            const hasRequiredRole = this.authService.hasAnyRole(requiredRoles);
            if (!hasRequiredRole) {
              this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: state.url, error: 'insufficient_permissions' }
              });
              return false;
            }
          }
          return true;
        } else {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}
