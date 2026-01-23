import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
  {
    path: 'stock-summary',
    loadComponent: () =>
      import('./stock-summary/stock-summary.component')
        .then(m => m.StockSummaryComponent)
  },
  {
    path: 'stock-movement',
    loadComponent: () =>
      import('./stock-movement-report/stock-movement-report.component')
        .then(m => m.StockMovementReportComponent)
  },
  {
    path: 'purchase',
    loadComponent: () =>
      import('./purchase-report/purchase-report.component')
        .then(m => m.PurchaseReportComponent)
  },
  {
    path : 'product',
    loadComponent :() =>
      import('./product-report/product-report.component')
    .then(m => m.ProductReportComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
