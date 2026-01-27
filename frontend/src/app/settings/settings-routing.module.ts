import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsLayoutComponent } from './settings-layout/settings-layout.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { BusinessSettingsComponent } from './business-settings/business-settings.component';
import { InventorySettingsComponent} from './inventory-settings/inventory-settings.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';


const routes: Routes = [
  {
    path: '',
    component: SettingsLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'account',
        pathMatch: 'full'
      },
      { path: 'account', component: AccountSettingsComponent },
      { path: 'business', component: BusinessSettingsComponent },
      { path: 'inventory', component: InventorySettingsComponent },
      { path: 'notifications', component: NotificationSettingsComponent },
      { path: 'security', component: SecuritySettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
