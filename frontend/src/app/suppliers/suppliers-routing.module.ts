import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { SupplierDetailsComponent } from './supplier-details/supplier-details.component';

const routes: Routes = [
  { path: '', component: SupplierListComponent },
  { path: 'add', component: SupplierFormComponent },
  { path: 'edit/:id', component: SupplierFormComponent },
  { path: 'details/:id', component: SupplierDetailsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuppliersRoutingModule { }
