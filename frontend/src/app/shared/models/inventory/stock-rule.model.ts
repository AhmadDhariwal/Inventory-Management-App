export interface StockRule {
  _id?: string;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  enableLowStockAlert: boolean;
  autoUpdateStock: boolean;
  defaultWarehouse?: string;
  requireApprovalForRemoval: boolean;
  autoReceivePurchase: boolean;
  autoDeductSales: boolean;
  enableBarcodeScanning: boolean;
  trackSerialNumbers: boolean;
  trackBatchNumbers: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockRuleResponse {
  success: boolean;
  data: StockRule;
  message: string;
}

export interface StockLevelCheck {
  isLow: boolean;
  isCritical: boolean;
  shouldAlert: boolean;
}