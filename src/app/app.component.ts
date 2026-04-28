import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { DialogService } from './services/dialog.service';
import { Router, RouterOutlet } from '@angular/router';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'sxv-studio';
  private isPromptingTerms = false;
  private readonly termsSummary = `Effective Date: April 2026

1. Acceptance of Conditions
By accessing SXV Studio / Sxvxge Studio, you agree to abide by these binding terms.

2. User Conduct & Hardware Interaction
Do not upload malicious scripts, reverse-engineer platform DSP, or artificially boost storage allocations.

3. Subscriptions, Payments, and Cancellations
Premium tiers are handled through Stripe. Cancellation language here currently says users may cancel through the Profile Management dashboard and keep access until the end of the current billing cycle.

4. Service Availability
The platform may occasionally be temporarily unavailable during upgrades or backend maintenance.`;

  constructor(
      private authService: AuthService,
      private dialogService: DialogService,
      private router: Router
  ) {}

  ngOnInit() {
      this.authService.currentUser$.subscribe(async user => {
          if (user && user.has_accepted_terms === false && !this.isPromptingTerms) {
              this.isPromptingTerms = true;
              const accepted = await this.dialogService.confirm(
                  "Welcome! Before you proceed, you must agree to our updated Terms of Service and Privacy Policy. Do you accept?",
                  "Terms & Privacy Update",
                  "I Accept",
                  "Decline",
                  {
                      auxiliaryLinkText: "View Terms",
                      auxiliaryDialogTitle: "Terms of Service",
                      auxiliaryDialogMessage: this.termsSummary
                  }
              );
              if (accepted) {
                  this.authService.acceptTerms().subscribe({
                      next: () => {
                          this.isPromptingTerms = false;
                          // Force a refresh locally so the boolean updates
                          user.has_accepted_terms = true;
                      },
                      error: async (err) => {
                          console.error('Accept Terms Error:', err);
                          await this.dialogService.alert('Could not sync Terms. Please try again or contact support.');
                          this.isPromptingTerms = false;
                          this.authService.logout();
                          this.router.navigate(['/']);
                      }
                  });
              } else {
                  this.authService.logout();
                  this.isPromptingTerms = false;
                  this.router.navigate(['/']);
              }
          }
      });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.isActivated ? outlet.activatedRoute : '';
  }
}
