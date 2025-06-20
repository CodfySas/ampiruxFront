import { Base } from "./base.interface";

export interface Barber extends Base {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  dni?: string;
  barbershop_uuid?: string;
  position?: string;
  hire_date?: string;
  base_salary?: string;
  commission_rate?: number;
  schedule?: Schedule[];
}

export interface Schedule extends Base {
  barber_uuid?: string;
  day_of_week?: number;
  active?: boolean;
  start_time?: string;
  end_time?: string;
}