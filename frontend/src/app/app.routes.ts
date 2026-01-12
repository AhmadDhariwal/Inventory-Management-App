import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ItemsListComponent } from './components/items-list/items-list.component';
import { ItemcreateComponent } from './components/itemcreate/itemcreate.component';
export const routes: Routes = [


  {

    path:'',
    loadComponent :() => {
      return import('./components/singup/singup.component').then
      ((m) => m.SingupComponent,
    )
    }
  },

  {
     path: 'login',
     loadComponent :() => {
      return import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      )
     }
  },
{
  path:'homepage', canActivate :[AuthGuard],
  loadComponent:() => {
    return import('./components/homepage/homepage.component').then(
      (m) => m.HomepageComponent,
    )
  }
},
  {
     path : 'inventory/all',canActivate: [AuthGuard],
    loadComponent : () => {
      return import('./components/items-list/items-list.component').then(
        (m) => m.ItemsListComponent,
      )
    }
  },

  {
     path : 'users/all',canActivate: [AuthGuard],
    loadComponent : () => {
      return import('./components/users/users.component').then(
        (m) => m.UsersComponent,
      )
    }
  },


  {
    path : 'create',canActivate: [AuthGuard],
    loadComponent : () => {
      return import('./components/itemcreate/itemcreate.component').then(
        (m) => m.ItemcreateComponent,
      )
    }
  },

  {
    path:'edit/:id',canActivate: [AuthGuard],
    loadComponent : () =>{
      return import('./components/itemcreate/itemcreate.component').then(
        (m) => m.ItemcreateComponent,
      )
    }
  },

];

