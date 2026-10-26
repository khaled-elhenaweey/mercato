import { Component, input, inject, signal, effect } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products';
import { Product } from '../../../core/models/product.model';
import { ImageGallery } from '../../../shared/components/image-gallery/image-gallery';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail-page',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, ImageGallery, ProductCard],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.css',
})
export class ProductDetailPage {
  // 2. id comes automatically as an input from Route via withComponentInputBinding()
  id = input.required<string>();

  private productsService = inject(ProductsService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  relatedLoading = signal<boolean>(false);
  error = signal<boolean>(false);
  quantity = signal<number>(1);

  constructor() {
    // 2. Effect triggered whenever the route 'id' changes
    effect(() => {
      const productId = this.id();
      if (productId) {
        this.fetchProductDetails(productId);
      }
    });
  }

  fetchProductDetails(id: string) {
    this.loading.set(true);
    this.error.set(false);
    this.quantity.set(1);

    this.productsService.getProductById(id).subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.loading.set(false);
        this.fetchRelated(prod.category, prod.id);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  fetchRelated(category: string, excludeId: number) {
    this.relatedLoading.set(true);
    this.productsService.getRelatedProducts(category, excludeId).subscribe({
      next: (items) => {
        this.relatedProducts.set(items);
        this.relatedLoading.set(false);
      },
      error: () => {
        this.relatedLoading.set(false);
      },
    });
  }

  increaseQty(maxStock: number) {
    if (this.quantity() < maxStock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(product: Product) {
    console.log(`Added ${this.quantity()} of ${product.title} to cart.`);
  }
}
