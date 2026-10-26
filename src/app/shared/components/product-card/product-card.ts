import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../../core/services/cart/cart.store';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();

  private cartStore = inject(CartStore);

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();
    this.cartStore.addItem(this.product(), 1);
    console.log('Added to cart:', this.product().title);
  }
}
