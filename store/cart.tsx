'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { CartItem } from '../data/types';
import {
  addLineItem,
  calculateCartTotals,
  CartTotals,
  removeLineItem,
  updateLineItemQuantity,
} from '../lib/cart';

interface CartState {
  items: CartItem[];
  appliedCoupon: string | null;
  totals: CartTotals;
  isDrawerOpen: boolean;
}

type CartAction =
  | { type: 'INITIALIZE'; payload: { items: CartItem[]; coupon: string | null } }
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TOGGLE_DRAWER' };

const initialTotals: CartTotals = {
  subtotal: 0,
  itemCount: 0,
  discount: 0,
  shippingFee: 0,
  total: 0,
  totalSavings: 0,
  appliedCoupon: null,
};

const initialState: CartState = {
  items: [],
  appliedCoupon: null,
  totals: initialTotals,
  isDrawerOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INITIALIZE': {
      const items = action.payload.items;
      const appliedCoupon = action.payload.coupon;
      const totals = calculateCartTotals(items, appliedCoupon);
      return {
        ...state,
        items,
        appliedCoupon,
        totals,
      };
    }

    case 'ADD_ITEM': {
      const updatedItems = addLineItem(state.items, action.payload);
      const totals = calculateCartTotals(updatedItems, state.appliedCoupon);
      return {
        ...state,
        items: updatedItems,
        totals,
        isDrawerOpen: true, // open drawer on add to bag
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = updateLineItemQuantity(
        state.items,
        action.payload.id,
        action.payload.quantity
      );
      const totals = calculateCartTotals(updatedItems, state.appliedCoupon);
      return {
        ...state,
        items: updatedItems,
        totals,
      };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = removeLineItem(state.items, action.payload.id);
      const totals = calculateCartTotals(updatedItems, state.appliedCoupon);
      return {
        ...state,
        items: updatedItems,
        totals,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        appliedCoupon: null,
        totals: initialTotals,
      };
    }

    case 'APPLY_COUPON': {
      const coupon = action.payload;
      const totals = calculateCartTotals(state.items, coupon);
      return {
        ...state,
        appliedCoupon: totals.appliedCoupon,
        totals,
      };
    }

    case 'REMOVE_COUPON': {
      const totals = calculateCartTotals(state.items, null);
      return {
        ...state,
        appliedCoupon: null,
        totals,
      };
    }

    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };

    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    default:
      return state;
  }
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => void;
  removeCouponCode: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'bee_beauty_cart_v1';
const COUPON_KEY = 'bee_beauty_coupon_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      const savedCoupon = localStorage.getItem(COUPON_KEY);
      const items: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
      dispatch({
        type: 'INITIALIZE',
        payload: { items, coupon: savedCoupon || null },
      });
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }, []);

  // Sync to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      if (state.appliedCoupon) {
        localStorage.setItem(COUPON_KEY, state.appliedCoupon);
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    } catch {
      // Ignore write errors
    }
  }, [state.items, state.appliedCoupon]);

  const value: CartContextValue = {
    ...state,
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    updateQuantity: (id, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    applyCouponCode: (code) => dispatch({ type: 'APPLY_COUPON', payload: code }),
    removeCouponCode: () => dispatch({ type: 'REMOVE_COUPON' }),
    openDrawer: () => dispatch({ type: 'OPEN_DRAWER' }),
    closeDrawer: () => dispatch({ type: 'CLOSE_DRAWER' }),
    toggleDrawer: () => dispatch({ type: 'TOGGLE_DRAWER' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
