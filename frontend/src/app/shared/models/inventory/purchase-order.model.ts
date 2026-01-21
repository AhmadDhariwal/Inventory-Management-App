import { Supplier } from './supplier.model';
import { Product } from './product.model';
import { Warehouse } from './warehouse.model';

export interface PurchaseOrderItem {
  product: Product;
  quantity: number;
  costprice: number;
}

export interface PurchaseOrder {
  _id: string;
  supplier: Supplier;
  warehouse: Warehouse;
  items: PurchaseOrderItem[];
  totalamount: number;
  status?: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  createdBy: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}
