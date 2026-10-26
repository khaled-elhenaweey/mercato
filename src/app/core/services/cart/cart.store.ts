import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private readonly STORAGE_KEY = 'mercato_cart_items';

  // State Signal
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  // Readonly public signal
  readonly items = this.itemsSignal.asReadonly();

  // Computed Signals
  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  readonly isEmpty = computed(() => this.itemsSignal().length === 0);

  constructor() {
    // Effect to persist changes to localStorage automatically
    effect(() => {
      const currentItems = this.itemsSignal();
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentItems));
      }
    });
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      return [];
    }
  }

  addItem(product: Product, quantity: number = 1): void {
    const items = this.itemsSignal();
    const existingIndex = items.findIndex((i) => i.productId === product.id);

    const effectivePrice =
      product.discountPercentage > 0
        ? Number((product.price * (1 - product.discountPercentage / 100)).toFixed(2))
        : product.price;

    if (existingIndex > -1) {
      const updated = [...items];
      const currentItem = updated[existingIndex];
      const newQty = Math.min(currentItem.quantity + quantity, product.stock);

      updated[existingIndex] = { ...currentItem, quantity: newQty };
      this.itemsSignal.set(updated);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        title: product.title,
        price: effectivePrice,
        thumbnail: product.thumbnail,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
      };
      this.itemsSignal.set([...items, newItem]);
    }
  }

  removeItem(productId: number): void {
    this.itemsSignal.set(this.itemsSignal().filter((i) => i.productId !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const items = this.itemsSignal();
    this.itemsSignal.set(
      items.map((item) => {
        if (item.productId === productId) {
          const validQty = Math.min(quantity, item.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      }),
    );
  }

  increment(productId: number): void {
    const item = this.itemsSignal().find((i) => i.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrement(productId: number): void {
    const item = this.itemsSignal().find((i) => i.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  clear(): void {
    this.itemsSignal.set([]);
  }
}
