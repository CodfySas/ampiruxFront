import { Barber } from "./barber.interface";
import { Base } from "./base.interface";
import { Client } from "./client.interface";
import { Product } from "./product.interface";
import { Service } from "./service.interface";

export interface Sale extends Base {
  client_uuid?: string;
  client?: Client;
  barber_uuid?: string;
  barber?: Barber;
  date?: string;
  status?: string;
  payment_method?: string;
  is_courtesy?: string;
  total?: number;
  discount_uuid?: string;
  barbershop_uuid?: string;
  sale_products?: SaleProduct[];
  services?: SaleServiceDto[];
}

export interface SaleProduct extends Base {
  product_uuid?: string;
  sale_uuid?: string;
  quantity?: number;
  unit?: string;
  cost_type?: string;
}

export interface SaleServiceDto extends Base {
  service_uuid?: string;
  service?: Service;
  sale_uuid?: string;
  price?: number;
  is_courtesy?: boolean;
  commission_rate?: number;
  barber_uuid?: string;
  used_products?: SaleServiceProductDto[];
}

export interface SaleServiceProductDto extends Base {
  sale_service_uuid?: string;
  product?: Product;
  product_uuid?: string;
  quantity?: number;
  unit?: string;
  cost_type?: string;
  price?: string;
}