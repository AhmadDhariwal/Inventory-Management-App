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
  status?: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  createdBy: { _id: string; name: string };
  approvedBy?: { _id: string; name: string };
  approvedAt?: string;
  receivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
