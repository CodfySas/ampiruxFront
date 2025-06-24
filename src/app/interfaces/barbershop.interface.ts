import { Barber } from "./barber.interface";
import { Base } from "./base.interface";
import { Client } from "./client.interface";
import { Product } from "./product.interface";
import { Service } from "./service.interface";

export interface BarberShop extends Base {
  name?: string;
}