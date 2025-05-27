
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Job {
  id: string;
  clientId: string;
  description: string;
  date: string;
  notes?: string;
}

export interface Item {
  id: string;
  name: string;
  unitPrice: string;
  category?: string;
}

export interface JobItem {
  id?: string;
  jobId: string;
  itemId: string;
  itemType: 'part' | 'labour';
  name: string;
  unitPrice: string;
  quantity: number;
  category?: string;
}

export interface TabRoute {
  key: string;
  title: string;
}
