import { Base } from "./base.interface";

export interface Product extends Base {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  unit?: string;
  category_uuid?: string;
  category?: ProductCategory;
  barbershop_uuid?: string;
  size_per_unit?: number;
  remain_unit?: number;
}

export interface ProductCategory extends Base {
  name?: string;
  barbershop_uuid?: string;
}