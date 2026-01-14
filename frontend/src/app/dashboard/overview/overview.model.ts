export interface dashboardstats {
  totalproducts: number;
  totalsuppliers: number;
  totalstock: number;
  totalpurchases: number;
  lowstockproducts: {
    name: string;
    sku: string;
    stockQuantity: number;
    minStockLevel: number;
  }[];
}
