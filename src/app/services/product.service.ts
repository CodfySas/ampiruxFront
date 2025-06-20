import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Product, ProductCategory } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getProducts(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Product>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<Product>>(
      `${this.apiUrl}/v1/products/filter/${where}`,
      {
        params,
        headers: {
          barbershop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  getCategories(): Observable<Page<ProductCategory>> {
    return this.http.get<Page<ProductCategory>>(
      `${this.apiUrl}/v1/product-categories`
    );
  }

  updateProduct(uuid: string, product: Product): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/v1/products/${uuid}`, product
    );
  }

  deleteProduct(uuid: string): Observable<Product> {
    return this.http.delete<Product>(
      `${this.apiUrl}/v1/products/${uuid}`
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiUrl}/v1/products`, product
    );
  }
}