import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  isVerifying = true;
  isSuccess = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    
    if (!token) {
      this.isVerifying = false;
      this.message = 'No verification token provided in the URL.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.isVerifying = false;
        this.isSuccess = true;
        this.message = 'Your account has been successfully verified! You can now log in.';
        // Auto redirect after 3s
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isVerifying = false;
        this.isSuccess = false;
        this.message = err.error?.message || 'Verification failed. The token may be invalid or expired.';
      }
    });
  }
}
