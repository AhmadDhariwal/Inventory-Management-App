import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'activity-logs',
    loadComponent: () => import('./activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
