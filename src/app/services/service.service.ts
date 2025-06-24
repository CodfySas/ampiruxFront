import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Service } from '../interfaces/service.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getServices(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Service>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<Service>>(
      `${this.apiUrl}/v1/services/filter/${where}`,
      {
        params,
        headers: {
          barbershop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateService(uuid: string, service: Service): Observable<Service> {
    return this.http.patch<Service>(
      `${this.apiUrl}/v1/services/${uuid}`, service
    );
  }

  deleteService(uuid: string): Observable<Service> {
    return this.http.delete<Service>(
      `${this.apiUrl}/v1/services/${uuid}`
    );
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(
      `${this.apiUrl}/v1/services`, service
    );
  }

  getServicesClient(barbershop_uuid: string): Observable<Page<Service>> {
  
    return this.http.get<Page<Service>>(
      `${this.apiUrl}/barber-shops/services`,
      {
        headers: {
          barbershop_uuid: barbershop_uuid || ''
        }
      }
    );
  }
}