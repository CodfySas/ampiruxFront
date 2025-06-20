import { Base } from "./base.interface";

export interface Client extends Base {
  name?: string;
  phone?: string;
  email?: string;
  preferred_barber_uuid?: string;
  dni?: string;
  notes?: string;
  barbershop_uuid?: string;
}