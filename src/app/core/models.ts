export type UserRole = 'admin' | 'company' | 'client' | 'driver';

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string;
  colorCode: string;
  isActive: boolean;
  availability: string;
}

export interface ManagedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  colorCode: string;
  availability: string;
  rating: number;
  deliveryFee: number;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand: string;
  subcategory: string;
  price: number;
  category: string;
  photos: string[];
  stock: number;
  status: 'active' | 'pending' | 'rejected';
  company: any;
  companyColorCode: string;
  salesCount: number;
  rating: number;
}

export interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  rating: number;
  deliveryFee: number;
  zone: string;
  locationLat?: number | null;
  locationLng?: number | null;
  distanceKm?: number | null;
  etaMinutes?: number | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  client: any;
  driver: any;
  items: OrderItem[];
  deliveryAddress: string;
  pickupAddress?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'accepted' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  refundStatus?: string;
  createdAt?: string;
}

export interface StockRequest {
  _id: string;
  company: any;
  product: any;
  quantity: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export const API_URL = 'http://localhost:3000';

export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt?: string;
}

export interface Offer {
  _id: string;
  company: any;
  title: string;
  commissionPercent: number;
  entryFee: number;
  conditions: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AuditEntry {
  _id: string;
  admin: any;
  action: string;
  details: string;
  createdAt?: string;
}

export interface Review {
  _id: string;
  client: any;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  user: any;
  subject: string;
  message: string;
  adminReply: string;
  status: 'open' | 'closed';
  createdAt?: string;
}
