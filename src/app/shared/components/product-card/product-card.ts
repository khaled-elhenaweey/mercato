import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../core/models/product.model';
@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
  addToCart = output<Product>();
}
