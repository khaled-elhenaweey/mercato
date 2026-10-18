import { Router } from '@angular/router';
import { ApiService } from './../api/api-service';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LoginRequest, LoginResponse, User } from '../../models/auth.model';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly apiService = inject(ApiService);

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }
  clearToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  login(credentialsL: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentialsL).pipe(
      tap((response) => {
        this.setToken(response.accessToken);
        this.currentUserSignal.set({
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          image: response.image,
        });
      }),
    );
  }
  logout(): void {
    this.clearToken();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  restoreSession(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    return this.apiService.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }
}
