import { Category } from "./category.model";

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category?: Category; // you can define a Category model later if needed
  cost: number;
  price: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
