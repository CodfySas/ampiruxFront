import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is logged in on service initialization
    const token = this.getToken();
    if (token) {
      // You might want to validate the token with the backend here
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          console.log(response);
          if (response.token) {
            localStorage.setItem('ampirux_token', response.token);
            const user = {
              name: response.name,
              lastname: response.lastname,
              email: response.email,
              uuid: response.uuid,
              fullName: response.name + " " + response.lastname,
              username: response.username,
              barbershop_uuid: response.barbershop_uuid,
            }
            localStorage.setItem('ampirux_user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('ampirux_token');
    localStorage.removeItem('ampirux_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('ampirux_token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('ampirux_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}