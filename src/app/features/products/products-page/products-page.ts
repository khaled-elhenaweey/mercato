import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../../core/services/products/products';
import { Product } from '../../../core/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../../../shared/components/product-skeleton/product-skeleton';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, MatIconModule, ProductCard, ProductSkeleton],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  private productsService = inject(ProductsService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    this.productsService.getProducts(12, 0).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onAddToCart(product: Product) {
    console.log('Added to cart:', product);
  }
}
