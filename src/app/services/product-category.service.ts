import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { ProductCategory } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getCategories(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<ProductCategory>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<ProductCategory>>(
      `${this.apiUrl}/v1/product-categories/filter/${where}`,
      {
        params,
        headers: {
          barbershop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateProductCategory(uuid: string, product: ProductCategory): Observable<ProductCategory> {
    return this.http.patch<ProductCategory>(
      `${this.apiUrl}/v1/product-categories/${uuid}`, product
    );
  }

  deleteProductCategory(uuid: string): Observable<ProductCategory> {
    return this.http.delete<ProductCategory>(
      `${this.apiUrl}/v1/product-categories/${uuid}`
    );
  }

  createProductCategory(product: ProductCategory): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(
      `${this.apiUrl}/v1/product-categories`, product
    );
  }
}