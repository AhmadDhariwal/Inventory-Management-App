import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

const routes: Routes = [
  { path: '', component: PurchaseListComponent },
  { path: 'new', component: PurchaseFormComponent },
  { path: 'edit/:id', component: PurchaseFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasesRoutingModule { }
