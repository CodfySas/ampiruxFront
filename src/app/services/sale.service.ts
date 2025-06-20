import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Sale } from '../interfaces/sale.interface';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getSales(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Sale>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<Sale>>(
      `${this.apiUrl}/v1/sales/filter/${where}`,
      {
        params,
        headers: {
          saleshop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateSale(uuid: string, sale: Sale): Observable<Sale> {
    return this.http.patch<Sale>(
      `${this.apiUrl}/v1/sales/${uuid}`, sale
    );
  }

  deleteSale(uuid: string): Observable<Sale> {
    return this.http.delete<Sale>(
      `${this.apiUrl}/v1/sales/${uuid}`
    );
  }

  createSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(
      `${this.apiUrl}/v1/sales`, sale
    );
  }
}