import { Base } from "./base.interface";
import { Client } from "./client.interface";
import { Sale } from "./sale.interface";
import { Service } from "./service.interface";

export interface CalendarResponse {
  out_of_month?: boolean;
  day_number?: number;
  day_of_week?: string;
  total_day?: string;
  tasks?: Appointment[];
}

export interface Appointment extends Base {
  client_uuid?: string;
  barber_uuid?: string;
  service_uuid?: string;
  scheduled_at?: string;
  status?: string; // "pending", "confirmed", "completed", "cancelled"
  notes?: string;
  barbershop_uuid?: string;
  read?: boolean;
  client?: Client;
  service?: Service;
  google_calendar_event_id?: string;
}

export interface ClientAppointment extends Base {
  dni?: string;
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  hour?: string;
  service_uuid?: string;
  notes?: string;
}