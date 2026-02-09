export interface Warehouse {
  _id?: string;
  name: string;
  address: string;
  isActive?: boolean;
  organizationId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
