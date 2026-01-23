import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';

const routes: Routes = [
  { path: '', component: PurchaseListComponent },
  { path: 'new', component: PurchaseFormComponent },
  { path: 'edit/:id', component: PurchaseFormComponent },
  { path: 'details/:id', component: PurchaseDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasesRoutingModule { }
