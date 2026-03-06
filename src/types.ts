export type Role = 'Admin' | 'User';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  profilePic: string;
}

export type ProductStatus = 'รอถ่ายรูป' | 'ถ่ายรูปแล้ว' | 'ส่งซ่อม' | 'ติดจอง' | 'ขายแล้ว';
export type ProductCondition = 'มือ1' | 'มือ2';

export interface Product {
  id: string; // barcode/qr
  dateAdded: string;
  brand: string;
  model: string;
  serialNumber: string;
  condition: ProductCondition;
  note: string;
  costPrice: number;
  sellPrice: number;
  sellerName: string;
  sellerPhone: string;
  sellerDob: string;
  status: ProductStatus;
  images: string[]; // array of image IDs
}

export interface Order {
  id: string;
  dateSold: string;
  productId: string;
  buyerName: string;
  buyerPhone: string;
  buyerDob: string;
  buyerAddress?: string;
  price: number;
}
