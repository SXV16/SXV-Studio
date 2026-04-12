import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { buildAssetUrl } from '../../utils/url.utils';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSaving = false;
  subscriptionStatus: any = null;

  constructor(private authService: AuthService, private dialogService: DialogService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        if (this.user.profile_pic_url) {
          this.previewUrl = buildAssetUrl(this.user.profile_pic_url);
        }
      },
      error: (err: any) => console.error(err)
    });

    this.authService.getSubscriptionStatus().subscribe({
      next: (status) => this.subscriptionStatus = status,
      error: (err) => console.error('Error fetching subscription status', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.isSaving = true;
    const formData = new FormData();
    formData.append('artist_name', this.user.artist_name || '');
    formData.append('bio', this.user.bio || '');
    if (this.selectedFile) {
      formData.append('profile_pic', this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.isEditing = false;
        // Update local memory
        if (res.user.profile_pic_url) {
          this.previewUrl = buildAssetUrl(res.user.profile_pic_url);
        }
      },
      error: (err: any) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }

  manageBilling() {
    this.authService.createPortalSession().subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        console.error('Error opening billing portal', err);
        alert('Could not open billing portal. Please contact support if you are a paying customer.');
      }
    });
  }

  async cancelSubscription() {
    if (await this.dialogService.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of the current billing cycle.')) {
      this.authService.cancelSubscription().subscribe({
        next: async (res) => {
          if (res.success) {
             this.subscriptionStatus.cancel_at_period_end = true;
             await this.dialogService.alert('Your subscription has been scheduled to cancel at the end of the billing period.');
          }
        },
        error: async (err) => {
          console.error(err);
           await this.dialogService.alert('Failed to cancel subscription.');
        }
      });
    }
  }
}
