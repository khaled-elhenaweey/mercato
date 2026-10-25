import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, switchMap } from 'rxjs';
import { ProductsService } from '../../../core/services/products/products';
import { Product, Category } from '../../../core/models/product.model';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../../../shared/components/product-skeleton/product-skeleton';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-products-page',
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    ProductCard,
    ProductSkeleton,
    Pagination,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  total = signal(0);

  // State Signals
  selectedCategory = signal<string | null>(null);
  sortOption = signal<string>('default');
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);

  // Computed Params for API Request
  queryState = computed(() => ({
    category: this.selectedCategory(),
    sort: this.sortOption(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));
  private queryState$ = toObservable(this.queryState);

  ngOnInit() {
    // 1. Fetch Categories
    this.productsService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });

    // 2. Read initial query params from URL
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory.set(params['category'] || null);
      this.sortOption.set(params['sort'] || 'default');
      this.currentPage.set(params['page'] ? +params['page'] : 1);
    });

    // 3. Convert queryState to Observable and fetch data via switchMap
    this.queryState$
      .pipe(
        switchMap((state) => {
          this.loading.set(true);
          this.error.set(null);

          const skip = (state.page - 1) * state.limit;
          let sortBy: string | undefined;
          let order: 'asc' | 'desc' | undefined;

          if (state.sort !== 'default') {
            const [field, ord] = state.sort.split('-');
            sortBy = field;
            order = ord as 'asc' | 'desc';
          }

          const request = state.category
            ? this.productsService.getProductsByCategory(
                state.category,
                state.limit,
                skip,
                sortBy,
                order,
              )
            : this.productsService.getProducts(state.limit, skip, sortBy, order);

          return request.pipe(
            catchError(() => {
              this.products.set([]);
              this.total.set(0);
              this.error.set('Failed to load products.');
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
      )
      .subscribe((res) => {
        this.products.set(res.products);
        this.total.set(res.total);
      });
  }

  // Event Handlers updating URL query params
  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory(),
        sort: this.sortOption() === 'default' ? null : this.sortOption(),
        page: this.currentPage() === 1 ? null : this.currentPage(),
      },
      queryParamsHandling: 'merge',
    });
  }

  onCategoryChange(slug: string | null) {
    this.selectedCategory.set(slug);
    this.currentPage.set(1); // Reset page on category change
    this.updateUrl();
  }

  onSortChange(sort: string) {
    this.sortOption.set(sort);
    this.currentPage.set(1); // Reset page on sort change
    this.updateUrl();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
