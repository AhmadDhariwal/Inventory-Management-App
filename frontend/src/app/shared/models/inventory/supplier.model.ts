export interface Supplier {
  _id: string;
  name: string;
  contactperson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentterms: 'CASH' | 'NET_15' | 'NET_30' | 'NET_60';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
