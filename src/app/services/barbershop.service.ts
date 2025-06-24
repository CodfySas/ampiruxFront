import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberShop } from '../interfaces/barbershop.interface';

@Injectable({
  providedIn: 'root'
})
export class BarberShopService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  get(code: string): Observable<BarberShop> {
    return this.http.get<BarberShop>(
      `${this.apiUrl}/barber-shops/${code}`
    );
  }

}