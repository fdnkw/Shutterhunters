import { create } from 'zustand';
import { Product, User, Order } from './types';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyMeZPNoTF-ZIrXc4EPOqO25mgD-5Te77I59UmZaeyCg729GxhBaxxDUop32bQWxledsQ/exec';

interface AppState {
  user: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  fetchData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  users: [],
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
        users: data.users || [],
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

  addUser: async (newUser) => {
    set((state) => ({ users: [...state.users, newUser] }));
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addUser', payload: newUser })
      });
    } catch (error) {
      console.error('Error adding user to GAS:', error);
    }
  },

  updateUser: async (id, updated) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUser', payload: { id, ...updated } })
      });
    } catch (error) {
      console.error('Error updating user in GAS:', error);
    }
  },

  deleteUser: async (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteUser', payload: { id } })
      });
    } catch (error) {
      console.error('Error deleting user in GAS:', error);
    }
  },
}));
