import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Page } from '../interfaces/base.interface';
import { Appointment, CalendarResponse } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  getAppointments(where: string, page: number, size: number, sortColumn = '', sortDirection = ''): Observable<Page<Appointment>> {
    let params: any = {
      page: page,
      size: size
    };
    if (sortColumn && sortDirection) {
      var sort = sortColumn
      if (sortColumn == 'created_at') {
        sort = 'createdAt'
      }
      params.sort = `${sort},${sortDirection}`;
    }
    return this.http.get<Page<Appointment>>(
      `${this.apiUrl}/v1/appointments/filter/${where}`,
      {
        params,
        headers: {
          appointmentshop_uuid: localStorage.getItem('barbershop_uuid') || ''
        }
      }
    );
  }

  updateAppointment(uuid: string, appointment: Appointment): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}/v1/appointments/${uuid}`, appointment
    );
  }

  deleteAppointment(uuid: string): Observable<Appointment> {
    return this.http.delete<Appointment>(
      `${this.apiUrl}/v1/appointments/${uuid}`
    );
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}/v1/appointments`, appointment
    );
  }

  getCalendarByMonth(month: number, year: number): Observable<[CalendarResponse[]] | void> {
    var url = `${this.apiUrl}/v1/appointments/month/${month}/${year}`
    return this.http.get<[CalendarResponse[]]>(url);
  }

  getCalendarByDay(day: number, month: number, year: number): Observable<CalendarResponse | void> {
    var url = `${this.apiUrl}/v1/appointments/day/${day}/${month}/${year}`
    return this.http.get<CalendarResponse>(url);
  }
}