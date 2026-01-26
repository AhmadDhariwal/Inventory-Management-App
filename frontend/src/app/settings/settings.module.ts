import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';

import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { BusinessSettingsComponent } from './business-settings/business-settings.component';
import { InventorySettingsComponent} from './inventory-settings/inventory-settings.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    AccountSettingsComponent,
    BusinessSettingsComponent,
    InventorySettingsComponent,
    NotificationSettingsComponent,
    SecuritySettingsComponent
  ]
})
export class SettingsModule { }
