export interface ProductStockRule {
  _id?: string;
  product: {
    _id: string;
    name: string;
    sku: string;
  };
  warehouse: {
    _id: string;
    name: string;
  };
  reorderLevel: number;
  minStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductStockRuleResponse {
  success: boolean;
  data: ProductStockRule;
  message: string;
}

export interface ProductStockRuleRequest {
  product: string;
  warehouse: string;
  reorderLevel: number;
  minStock: number;
}