import { Base } from "./base.interface";
import { Product } from "./product.interface";

export interface Service extends Base {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  default_products?: ServiceDefaultProduct[];
  barbershop_uuid?: string;
}

export interface ServiceDefaultProduct extends Base {
  service_uuid?: string;
  product_uuid?: string;
  product?: Product;
  quantity?: number;
  unit?: string;
  cost_type?: string;
}