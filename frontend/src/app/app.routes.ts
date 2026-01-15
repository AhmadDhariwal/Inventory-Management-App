import { DashboardModule } from './dashboard/dashboard.module';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ItemsListComponent } from './components/items-list/items-list.component';
import { ItemcreateComponent } from './components/itemcreate/itemcreate.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren : () =>
          import("./dashboard/dashboard.module").then(
          (m) => m.DashboardModule,
          )
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('./stock/stock.module').then(m => m.StockModule)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
]


//   {

//     path:'',
//     loadComponent :() => {
//       return import('./components/singup/singup.component').then
//       ((m) => m.SingupComponent,
//     )
//     }
//   },

//   {
//      path: 'login',
//      loadComponent :() => {
//       return import('./components/login/login.component').then(
//         (m) => m.LoginComponent,
//       )
//      }
//   },
// {
//   path:'homepage', canActivate :[AuthGuard],
//   loadComponent:() => {
//     return import('./components/homepage/homepage.component').then(
//       (m) => m.HomepageComponent,
//     )
//   }
// },
//   {
//      path : 'inventory/all',canActivate: [AuthGuard],
//     loadComponent : () => {
//       return import('./components/items-list/items-list.component').then(
//         (m) => m.ItemsListComponent,
//       )
//     }
//   },

//   {
//      path : 'users/all',canActivate: [AuthGuard],
//     loadComponent : () => {
//       return import('./components/users/users.component').then(
//         (m) => m.UsersComponent,
//       )
//     }
//   },


//   {
//     path : 'create',canActivate: [AuthGuard],
//     loadComponent : () => {
//       return import('./components/itemcreate/itemcreate.component').then(
//         (m) => m.ItemcreateComponent,
//       )
//     }
//   },

//   {
//     path:'edit/:id',canActivate: [AuthGuard],
//     loadComponent : () =>{
//       return import('./components/itemcreate/itemcreate.component').then(
//         (m) => m.ItemcreateComponent,
//       )
//     }
//   },

// ];

