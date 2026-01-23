import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PurchasesRoutingModule } from './purchases-routing.module';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PurchasesRoutingModule,
    PurchaseFormComponent,
    PurchaseListComponent,
    PurchaseDetailsComponent
  ]
})
export class PurchasesModule { }
