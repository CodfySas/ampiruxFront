import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Barber } from '../interfaces/barber.interface';

@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getBarbers(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Barber>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<Barber>>(
      `${this.apiUrl}/v1/barbers/filter/${where}`,
      {
        params,
        headers: {
          barbershop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateBarber(uuid: string, barber: Barber): Observable<Barber> {
    return this.http.patch<Barber>(
      `${this.apiUrl}/v1/barbers/${uuid}`, barber
    );
  }

  deleteBarber(uuid: string): Observable<Barber> {
    return this.http.delete<Barber>(
      `${this.apiUrl}/v1/barbers/${uuid}`
    );
  }

  createBarber(barber: Barber): Observable<Barber> {
    return this.http.post<Barber>(
      `${this.apiUrl}/v1/barbers`, barber
    );
  }
}