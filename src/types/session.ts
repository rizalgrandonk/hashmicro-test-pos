import { SessionData } from "express-session";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

declare module "express-session" {
  interface SessionData {
    user?: AuthUser;
    cart?: CartItem[];
  }
}
