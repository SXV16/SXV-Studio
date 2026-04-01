import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface AudioTrack {
  id: number;
  title: string;
  file_url: string;
  created_at: string;
  file_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = 'http://localhost:3000/api/tracks';

  constructor(private http: HttpClient) { }

  uploadTrack(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  uploadTrackMetadata(data: { title: string; file_url: string; user_id?: number; file_size?: number }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getDemoTracks(): Observable<AudioTrack[]> {
    return of([
      { id: 1, title: 'Neon Nights Demo', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', created_at: new Date().toISOString() },
      { id: 2, title: 'Synthwave Bassline', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, title: 'Midnight Vocal Take 1', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: 4, title: 'Cyberpunk Arp loop', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: 5, title: 'Retrowave Pads', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', created_at: new Date(Date.now() - 345600000).toISOString() }
    ]);
  }

  getTracks(): Observable<AudioTrack[]> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
           return this.http.get<AudioTrack[]>(`${this.apiUrl}/user/${user.id}`);
        }
      } catch (e) {
        console.warn("Cleared stale local storage user item");
        localStorage.removeItem('user');
      }
    }
    // Guest users get demo tracks
    return this.getDemoTracks();
  }

  deleteTrack(id: number): Observable<any> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        // Real database track
        return this.http.delete(`${this.apiUrl}/${id}`);
    } else {
        // Can't really delete a demo track from server, just return success
        return of({ success: true, message: 'Mock track deleted' });
    }
  }
}
