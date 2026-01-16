export interface StockRule {
  productId: string;
  warehouseId: string;
  minStock: number;
  reorderLevel: number;
}
