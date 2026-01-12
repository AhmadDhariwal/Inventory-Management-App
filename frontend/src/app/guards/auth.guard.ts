import { Injectable } from '@angular/core';
import { ItemService } from './../services/item.service';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private itemService : ItemService, private router: Router){};
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(this.itemService.isAuthenticated()) {

      return true
    }
     else {
      alert("Please login to access this page");
      this.router.navigate(['/login']);
      return false;
    }
  }

}
