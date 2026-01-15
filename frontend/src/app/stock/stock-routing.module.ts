import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockMovementListComponent } from './stock-movement/stock-movement-list/stock-movement-list.component';
import { StockMovementFormComponent } from './stock-movement/stock-movement-form/stock-movement-form.component';
import { StockMovementDetailComponent } from './stock-movement/stock-movement-detail/stock-movement-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'movements', pathMatch: 'full' },

  { path: 'movements',
     component: StockMovementListComponent },

  { path: 'movements/new',
     component: StockMovementFormComponent },
     
   {
        path: ':id',
        component: StockMovementDetailComponent
      }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule {}
