import { Product } from './product.model';
import { Warehouse } from './warehouse.model';

export interface StockMovement {
  _id: string;
  product: Product;        // populated backend reference
  warehouse: Warehouse;    // populated backend reference
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  user: { _id: string; name: string }; // createdBy info
  createdAt: string;
  updatedAt: string;
}
