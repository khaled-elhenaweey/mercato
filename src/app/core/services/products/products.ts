import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api-service';
import { ProductsResponse } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiService = inject(ApiService);

  getProducts(limit: number = 12, skip: number = 0): Observable<ProductsResponse> {
    return this.apiService.get<ProductsResponse>('/products', { limit, skip });
  }
}
