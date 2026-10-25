import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  catchError,
  of,
  startWith,
  tap,
} from 'rxjs';
import { ProductsService } from '../../../core/services/products/products';
import { Product } from '../../../core/models/product.model';
@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  searchControl = new FormControl('');
  isOpen = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // RxJS Pipeline for Live Search
  searchResults = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((text) => (text ? text.trim() : '')),
      distinctUntilChanged(),
      tap((text) => {
        if (text.length < 2) {
          this.isOpen.set(false);
          this.isLoading.set(false);
        } else {
          this.isOpen.set(true);
          this.isLoading.set(true);
          this.error.set(null);
        }
      }),
      filter((text) => text.length >= 2),
      switchMap((query) =>
        this.productsService.searchProducts(query, 5).pipe(
          map((res) => {
            this.isLoading.set(false);
            return res.products;
          }),
          catchError(() => {
            this.isLoading.set(false);
            this.error.set('Failed to fetch search results.');
            return of([]);
          }),
        ),
      ),
    ),
    { initialValue: [] as Product[] },
  );

  clearSearch() {
    this.searchControl.setValue('');
    this.isOpen.set(false);
  }

  selectProduct(id: number) {
    this.isOpen.set(false);
    this.router.navigate(['/products', id]);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  // Close dropdown on Escape key
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.isOpen.set(false);
  }
}
