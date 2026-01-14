import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainLayoutComponent } from './main-layout/main-layout.component';
import { SidebarComponent } from './main-layout/sidebar/sidebar.component';
import { FooterComponent } from './main-layout/footer/footer.component';
import { NavbarComponent } from '../components/navbarr/navbarr.component';



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    RouterModule,
    MainLayoutComponent,
     NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  exports: [
    MainLayoutComponent
  ]
})
export class LayoutModule { }
