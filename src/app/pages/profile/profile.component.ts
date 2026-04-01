import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        if (this.user.profile_pic_url) {
          this.previewUrl = `http://localhost:3000${this.user.profile_pic_url}`;
        }
      },
      error: (err: any) => console.error(err)
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
          this.previewUrl = `http://localhost:3000${res.user.profile_pic_url}`;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.isSaving = false;
      }
    });
  }
}

