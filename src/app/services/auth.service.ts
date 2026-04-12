import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { buildApiUrl } from '../utils/url.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiAuthUrl = buildApiUrl('/api/auth');
  private apiProfileUrl = buildApiUrl('/api/profile');
  private apiStripeUrl = buildApiUrl('/api/stripe');
  
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
    return this.http.post(`${this.apiAuthUrl}/verify`, { token });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/reset-password`, { token, newPassword });
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

  createPortalSession(): Observable<any> {
    return this.http.post(`${this.apiStripeUrl}/create-portal-session`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getSubscriptionStatus(): Observable<any> {
    return this.http.get(`${this.apiStripeUrl}/subscription-status`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  cancelSubscription(): Observable<any> {
    return this.http.post(`${this.apiStripeUrl}/cancel-subscription`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Password Migration
  syncMigratedPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/sync-password`, { email, newPassword });
  }

  acceptTerms(): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/accept-terms`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).pipe(
      tap((res: any) => {
        if (res?.success) {
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = { ...currentUser, has_accepted_terms: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
