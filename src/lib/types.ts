
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: number; // e.g., 0.1 for 10%
  unitsSold: number;
  rating: number; // 1-5
  image: string;
  livePreviewLink: string;
  category: 'Telegram Mini Apps' | 'Android Apps' | 'Websites' | 'Bots' | 'Tools' | 'Services' | 'Games' | 'Social Accounts';
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  customerName: string;
  customerEmail: string;
  paymentId?: string; // Transaction ID
  orderDate: Date;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export interface SellRequest {
  id: string;
  productName: string;
  productLink: string;
  price: number;
  email: string;
  phone: string;
  message: string;
  submissionDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface MyApp {
  id: string;
  name: string;
  image: string;
  installLink: string;
}
