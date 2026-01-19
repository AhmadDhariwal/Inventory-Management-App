import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockMovementListComponent } from './stock-movement/stock-movement-list/stock-movement-list.component';
import { StockMovementFormComponent } from './stock-movement/stock-movement-form/stock-movement-form.component';
import { StockMovementDetailComponent } from './stock-movement/stock-movement-detail/stock-movement-detail.component';
import { StockOverviewComponent } from './stock-overview/stock-overview.component';
import { StockComponent } from './stock.component';
import { StockLevelsComponent } from './stock-levels/stock-levels.component';
import { StockSummaryComponent } from './reports/stock-summary/stock-summary.component';
import { StockMovementReportComponent } from './reports/stock-movement-report/stock-movement-report.component';

const routes: Routes = [
  {
    path: '',
    component: StockComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: StockOverviewComponent },
      { path: 'levels', component: StockLevelsComponent},
      { path: 'movements', component: StockMovementListComponent },
      {
        path: 'reports',
        children: [
          {
            path: 'summary',
            component: StockSummaryComponent
          },
          {
            path: 'movements',
            component: StockMovementReportComponent
          },
        ]
      }
    ]
  },
  { path: 'movements/new', component: StockMovementFormComponent },
  { path: 'movements/:id', component: StockMovementDetailComponent }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule {}
