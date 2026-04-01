import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiAuthUrl = 'http://localhost:3000/api/auth';
  private apiProfileUrl = 'http://localhost:3000/api/profile';
  private apiStripeUrl = 'http://localhost:3000/api/stripe';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchProfile(token);
    }
  }

  // Fetch the full profile from our backend using Native JWT
  private fetchProfile(token: string) {
    this.http.get(this.apiProfileUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: () => this.logout()
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
          }
          this.fetchProfile(res.token);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/register`, userData);
  }

  verifyEmail(token: string): Observable<any> {
    // Native Node verification stub
    return this.http.post(`${this.apiAuthUrl}/verify`, { token });
  }

  // Profile API
  getProfile(): Observable<any> {
    return this.http.get(this.apiProfileUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(this.apiProfileUrl, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).pipe(
      tap((res: any) => {
        if (res.user) {
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  // Stripe
  createCheckoutSession(tier: string): Observable<any> {
    return this.http.post(`${this.apiStripeUrl}/create-checkout-session`, { planTier: tier }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  verifyStripeSession(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiStripeUrl}/verify-session?session_id=${sessionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).pipe(
      tap((res: any) => {
        if (res.success && res.newTier) {
          const token = localStorage.getItem('token');
          if (token) {
            this.fetchProfile(token);
          }
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
}
