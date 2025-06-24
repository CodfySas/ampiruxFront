import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Commission } from '../interfaces/commission.interface';

@Injectable({
  providedIn: 'root'
})
export class CommissionService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getCommissions(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Commission>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      var sort = sortColumn
      if(sortColumn == 'created_at'){
        sort = 'createdAt'
      }
      params.sort = `${sort},${sortDirection}`;
    }
    return this.http.get<Page<Commission>>(
      `${this.apiUrl}/v1/commissions/filter/${where}`,
      {
        params,
        headers: {
          commissionshop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateCommission(uuid: string, commission: Commission): Observable<Commission> {
    return this.http.patch<Commission>(
      `${this.apiUrl}/v1/commissions/${uuid}`, commission
    );
  }

  deleteCommission(uuid: string): Observable<Commission> {
    return this.http.delete<Commission>(
      `${this.apiUrl}/v1/commissions/${uuid}`
    );
  }

  createCommission(commission: Commission): Observable<Commission> {
    return this.http.post<Commission>(
      `${this.apiUrl}/v1/commissions`, commission
    );
  }

  getHistory(barber: string, page: number, size: number): Observable<Page<Commission>> {
    let params: any = {
      page: page,
      size: size
    };
    params.sort = `createdAt,desc`
    return this.http.get<Page<Commission>>(
      `${this.apiUrl}/v1/commissions/history/${barber}`, {
        params
      }
    );
  }

  payCommissions(barber: string): Observable<Commission[]> {
    return this.http.post<Commission[]>(
      `${this.apiUrl}/v1/commissions/paid/${barber}`, null
    );
  }
}