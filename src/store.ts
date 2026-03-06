import { create } from 'zustand';
import { Product, User, Order } from './types';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxvdXHSCAt7rK4qI-Lc0MAS9t278AAzjfjyQBDHM3zpIdbZ3pMZnIjkr2VlMVu4LptDnw/exec';

interface AppState {
  user: User | null;
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  fetchData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  products: [],
  orders: [],
  isLoading: false,
  
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(GAS_URL);
      const data = await response.json();
      set({ 
        products: data.products || [], 
        orders: data.orders || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching data from GAS:', error);
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    // Optimistic UI update
    set((state) => ({ products: [...state.products, product] }));
    
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addProduct', payload: product })
      });
    } catch (error) {
      console.error('Error adding product to GAS:', error);
    }
  },

  updateProduct: async (id, updated) => {
    // Optimistic UI update
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
    
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateProduct', payload: { id, ...updated } })
      });
    } catch (error) {
      console.error('Error updating product in GAS:', error);
    }
  },

  addOrder: async (order) => {
    // Optimistic UI update
    set((state) => ({ orders: [...state.orders, order] }));
    
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addOrder', payload: order })
      });
    } catch (error) {
      console.error('Error adding order to GAS:', error);
    }
  },
}));
