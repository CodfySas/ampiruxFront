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
  services?: SaleServiceDto[];
  products?: SaleProduct[];
  subtotal_services?: number;
  commissions?: number;
  commission_discount?: number;
  subtotal_service_products?: number;
  subtotal_products?: number;
  discount_percent?: number;
  subtotal_discount?: number;
  has_iva?: boolean;
  iva_service?: boolean;
  iva_product?: boolean;
  iva?: number;
  subtotal_services_iva?: number;
  subtotal_products_iva?: number;
  subtotal_service_products_iva?: number;
  read?: boolean;
}

export interface SaleProduct extends Base {
  product_uuid?: string;
  sale_uuid?: string;
  quantity?: number;
  price?: number;
  total?: number;
  product?: Product;
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
  detail?: boolean; 
}

export interface SaleServiceProductDto extends Base {
  sale_service_uuid?: string;
  product?: Product;
  product_uuid?: string;
  quantity?: number;
  unit?: string;
  cost_type?: string;
  price?: number;
}