export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms: 'CASH' | 'NET_15' | 'NET_30' | 'NET_60';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
