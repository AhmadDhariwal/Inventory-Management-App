import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CategoryManagementComponent } from './category-management/category-management.component';
import { WarehouseManagementComponent } from './warehouse-management/warehouse-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'categories',
    component: CategoryManagementComponent,
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'warehouses',
    component: WarehouseManagementComponent,
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'new',
    component: ProductFormComponent
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent
  },
  {
  path: 'details/:id',
  component: ProductDetailsComponent
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
