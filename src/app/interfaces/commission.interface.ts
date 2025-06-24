import { Base } from "./base.interface";
import { Sale } from "./sale.interface";
import { Service } from "./service.interface";

export interface Commission extends Base {
  barber_uuid?: string;
  sale_service_uuid?: string;
  amount?: number;
  status?: string;
  paid_at?: string;
  sale?: Sale;
  service?: Service;
}