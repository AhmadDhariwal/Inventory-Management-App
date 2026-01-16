import { Product } from './product.model';
import { Warehouse } from './warehouse.model';

export interface StockLevel {
  product: Product;
  warehouse: Warehouse;
  availableQty: number;
  reservedQty: number;
  reorderLevel: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}
