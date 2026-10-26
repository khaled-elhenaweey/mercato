import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api-service';
import { Product, ProductsResponse, Category } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiService = inject(ApiService);

  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/products/categories');
  }

  getProducts(
    limit: number = 12,
    skip: number = 0,
    sortBy?: string,
    order?: 'asc' | 'desc',
  ): Observable<ProductsResponse> {
    let params: Record<string, any> = { limit, skip };
    if (sortBy) {
      params['sortBy'] = sortBy;
      params['order'] = order || 'asc';
    }
    return this.apiService.get<ProductsResponse>('/products', params);
  }

  getProductsByCategory(
    slug: string,
    limit: number = 12,
    skip: number = 0,
    sortBy?: string,
    order?: 'asc' | 'desc',
  ): Observable<ProductsResponse> {
    let params: Record<string, any> = { limit, skip };
    if (sortBy) {
      params['sortBy'] = sortBy;
      params['order'] = order || 'asc';
    }
    return this.apiService.get<ProductsResponse>(`/products/category/${slug}`, params);
  }

  searchProducts(query: string, limit: number = 5): Observable<ProductsResponse> {
    return this.apiService.get<ProductsResponse>('/products/search', { q: query, limit });
  }

  getProductById(id: number | string): Observable<Product> {
    return this.apiService.get<Product>(`/products/${id}`);
  }

  getRelatedProducts(category: string, excludeId: number): Observable<Product[]> {
    return this.apiService
      .get<ProductsResponse>(`/products/category/${category}`)
      .pipe(map((res) => res.products.filter((p) => p.id !== excludeId)));
  }
}
