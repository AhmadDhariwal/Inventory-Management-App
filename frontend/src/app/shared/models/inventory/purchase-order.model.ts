import { Supplier } from './supplier.model';
import { Product } from './product.model';

export interface PurchaseOrderItem {
  product: Product;
  quantity: number;
  costPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdBy: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}
