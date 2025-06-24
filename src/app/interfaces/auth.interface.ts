import { Base } from "./base.interface";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  uuid: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  fullName: string;
  barbershop_uuid: string;
  barbershop_code: string;
}

export interface User extends Base {
  username: string;
  email: string;
  name: string;
  lastname: string;
  fullName: string;
  barbershop_uuid: string;
  barbershop_code: string;
}