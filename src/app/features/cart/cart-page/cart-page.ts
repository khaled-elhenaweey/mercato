import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartStore } from '../../../core/services/cart/cart.store';
@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  cartStore = inject(CartStore);
}
