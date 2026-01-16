export interface LowStock {
  productId: string;
  productName: string;
  warehouseName: string;
  availableQty: number;
  minStock: number;
  reorderLevel: number;
}
