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
}

export interface User {
  uuid: string;
  username: string;
  email: string;
  name: string;
  lastname: string;
  fullName: string;
}