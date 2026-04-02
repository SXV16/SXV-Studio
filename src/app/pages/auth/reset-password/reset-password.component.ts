import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  error: string = '';
  successMsg: string = '';
  loading: boolean = false;
  nativeResetToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.nativeResetToken = this.route.snapshot.queryParamMap.get('token');

    if (this.nativeResetToken) {
      return;
    }

    // Supabase automatically parses the access_token from the URL hash and establishes a session.
    this.supabaseService.client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
         // this just signifies we are in recovery mode.
         console.log('Password recovery mode active.');
      }
    });
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMsg = '';

    const newPassword = this.resetForm.value.password;

    if (this.nativeResetToken) {
      this.authService.resetPassword(this.nativeResetToken, newPassword).subscribe({
        next: (res) => {
          this.successMsg = res.message || 'Password successfully updated! You can now log in securely.';
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to reset password. Please request a new link.';
          this.loading = false;
        }
      });
      return;
    }

    try {
      // 1. Get the current user email inferred from the recovery session in v1
      const user = this.supabaseService.client.auth.user();
      
      if (!user || !user.email) {
        this.error = 'Invalid or expired recovery session. Please request a new link.';
        return;
      }

      const email = user.email;

      // 2. Update password in Supabase Auth (for completeness/security of the legacy account)
      const { error: updateError } = await this.supabaseService.client.auth.update({
        password: newPassword
      });

      if (updateError) {
        this.error = updateError.message;
        return;
      }

      // 3. Sync the new password to our Native Backend so the user can login normally
      this.authService.syncMigratedPassword(email, newPassword).subscribe({
        next: () => {
           this.successMsg = 'Password successfully updated! You can now log in securely.';
           this.supabaseService.client.auth.signOut(); // Clean up supabase session afterward
           this.loading = false;
        },
        error: (err) => {
           this.error = err.error?.message || 'Failed to sync password to native backend. Please contact support.';
           this.loading = false;
        }
      });

    } catch (err: any) {
      this.error = 'An unexpected error occurred. Please try again.';
      this.loading = false;
    }
  }
}
