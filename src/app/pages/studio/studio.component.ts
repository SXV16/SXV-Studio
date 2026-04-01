import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TrackService } from '../../services/track.service';
import { SupabaseService } from '../../services/supabase.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.css']
})
export class StudioComponent implements OnInit, OnDestroy {
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioUrl: SafeUrl | null = null;
  savedMessage: string = '';
  recordingTime = 0;
  timerInterval: any;

  constructor(
    private trackService: TrackService, 
    private cdr: ChangeDetectorRef, 
    private supabaseService: SupabaseService,
    private sanitizer: DomSanitizer,
    private dialogService: DialogService
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.stopRecording();
  }

  async startRecording() {
    this.savedMessage = '';
    this.audioUrl = null;
    this.audioChunks = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const objectUrl = URL.createObjectURL(audioBlob);
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);

        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
        this.cdr.detectChanges(); // Fix Angular Zone issue
      };

      this.mediaRecorder.start(250); // Capture chunks every 250ms natively
      this.isRecording = true;
      this.startTimer();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      await this.dialogService.alert('Could not access microphone! Make sure you granted permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
    }
  }

  startTimer() {
    this.recordingTime = 0;
    this.timerInterval = setInterval(() => {
      this.recordingTime++;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async saveTrack() {
    if (!this.audioChunks.length) return;

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const title = await this.dialogService.prompt('Enter a title for your track:', `My Neon Track ${this.formatTime(this.recordingTime)}`);

    if (!title) return;

    let userId: number | undefined;
    const userStr = localStorage.getItem('user');
    if (userStr) {
       const user = JSON.parse(userStr);
       userId = user.id;
    }

    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'mp4' : (mimeType.includes('ogg') ? 'ogg' : 'webm');
    const uniqueFilename = `studio-track-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

    const { url, error } = await this.supabaseService.uploadAudioTrack(audioBlob, uniqueFilename);

    if (error || !url) {
        console.error('Error uploading to Supabase:', error);
        await this.dialogService.alert('Failed to save to Cloud Storage. Make sure the "audio-tracks" bucket exists and is public.');
        return;
    }

    this.trackService.uploadTrackMetadata({ title, file_url: url, user_id: userId }).subscribe({
      next: (res) => {
        this.savedMessage = "Track saved successfully!";
        this.audioUrl = null;
        this.cdr.detectChanges();
      },
      error: async (err) => {
        console.error('Error saving track:', err);
        await this.dialogService.alert('Failed to save track.');
      }
    });
  }
}
