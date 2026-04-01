import { Component, OnInit } from '@angular/core';
import { TrackService, AudioTrack } from '../../services/track.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  tracks: AudioTrack[] = [];
  loading = true;

  constructor(private trackService: TrackService, private dialogService: DialogService) { }

  ngOnInit() {
    this.loadTracks();
  }

  loadTracks() {
    this.loading = true;
    this.trackService.getTracks().subscribe({
      next: (data: any) => {
        this.tracks = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load tracks', err);
        this.loading = false;
      }
    });
  }

  async deleteTrack(id: number) {
    if (await this.dialogService.confirm('Are you sure you want to delete this track?')) {
      this.trackService.deleteTrack(id).subscribe(() => {
        this.loadTracks();
      });
    }
  }

  // Audio Playback
  currentAudio: HTMLAudioElement | null = null;
  playingTrackId: number | null = null;

  playTrack(track: AudioTrack) {
    if (this.playingTrackId === track.id && this.currentAudio) {
      if (this.currentAudio.paused) {
        this.currentAudio.play();
      } else {
        this.currentAudio.pause();
      }
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    let url = track.file_url;
    if (!url.startsWith('http')) {
      const baseUrl = 'http://localhost:3000';
      url = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    }

    this.currentAudio = new Audio(url);
    this.currentAudio.play().catch(async e => {
        console.error("Playback failed", e);
        await this.dialogService.alert("Audio file could not be played. It might be missing or corrupt.");
    });
    this.playingTrackId = track.id;

    this.currentAudio.onended = () => {
      this.playingTrackId = null;
    };
  }
}
