import { login } from './../../../../model/login';
import { ItemService } from './../../services/item.service';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router,ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { UsersComponent } from '../users/users.component';
import { LoginComponent } from '../login/login.component';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule,NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
   title = signal("Inventory Management App ");
   user : string ='';
    private itemService = inject(ItemService);

    constructor(
          private router: Router,
          private route : ActivatedRoute
        ) {}

        isAuthenticated(): boolean {
          return this.itemService.isAuthenticated();
        }

        isadmin() : boolean {
         return this.itemService.isadmin();
        }

    onLogout(): void {

    this.itemService.logout();
    console.log("Logout successful");
   this.router.navigate(['/login']);


}

}
