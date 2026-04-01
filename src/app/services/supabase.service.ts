import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pzkqeeenbzkltiqccdfn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PbEGhjU3Jf5cm23AfwUaWg_wKXY_xz8';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  get client() {
    return this.supabase;
  }

  /**
   * Upload an audio blob to Supabase storage.
   * Assumes a public bucket named "audio-tracks" exists.
   */
  async uploadAudioTrack(blob: Blob, uniqueFilename: string): Promise<{ url: string | null; error: any }> {
    try {
      const { data, error } = await this.supabase.storage
        .from('audio-tracks')
        .upload(`public/${uniqueFilename}`, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type || 'audio/webm'
        });

      if (error) {
        return { url: null, error };
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('audio-tracks')
        .getPublicUrl(`public/${uniqueFilename}`);

      return { url: publicUrlData?.publicURL || null, error: null };
    } catch (e) {
      return { url: null, error: e };
    }
  }
}
