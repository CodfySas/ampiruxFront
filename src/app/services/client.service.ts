import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Client } from '../interfaces/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getClients(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Client>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      params.sort = `${sortColumn},${sortDirection}`;
    }
    return this.http.get<Page<Client>>(
      `${this.apiUrl}/v1/clients/filter/${where}`,
      {
        params,
        headers: {
          barbershop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateClient(uuid: string, client: Client): Observable<Client> {
    return this.http.patch<Client>(
      `${this.apiUrl}/v1/clients/${uuid}`, client
    );
  }

  deleteClient(uuid: string): Observable<Client> {
    return this.http.delete<Client>(
      `${this.apiUrl}/v1/clients/${uuid}`
    );
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(
      `${this.apiUrl}/v1/clients`, client
    );
  }
}