export interface Property {
  propertyName: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  NIC: string;
  active: boolean;
  createdDate: string;
  properties: Property[];
  receiveEmail: boolean;
  receiveSMS: boolean;
}
