import { Product } from './product.model';

export interface SalesOrderItem {
  product: Product;
  quantity: number;
  sellingPrice: number;
}

export interface SalesOrder {
  _id: string;
  items: SalesOrderItem[];
  totalAmount: number;
  createdBy: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}
