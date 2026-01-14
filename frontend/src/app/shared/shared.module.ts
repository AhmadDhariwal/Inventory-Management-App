import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    KpiCardComponent
  ],
  exports: [
    KpiCardComponent
  ]
})
export class SharedModule { }
