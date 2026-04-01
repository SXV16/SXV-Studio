import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCtx: AudioContext;
  private masterGain: GainNode;
  
  // Cache decoded HTML5 audio matrices in RAM to prevent redundant network fetching
  private audioBuffers = new Map<string, AudioBuffer>();
  
  // Track active nodes for precise stopping mechanics
  private activeNodes: AudioBufferSourceNode[] = [];

  public masterAnalyzer: AnalyserNode;

  constructor() { 
      // Initialize the core hardware DSP engine natively in the browser
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Route all signals through a Master Gain to safely clamp 0dbfs limits
      this.masterGain = this.audioCtx.createGain();
      
      this.masterAnalyzer = this.audioCtx.createAnalyser();
      this.masterAnalyzer.fftSize = 64; // Yields exactly 32 resolution bins
      
      this.masterGain.connect(this.masterAnalyzer);
      this.masterAnalyzer.connect(this.audioCtx.destination);
      
      this.masterGain.gain.value = 1.0;
  }

  // Suspends or resumes the context natively based on browser interaction policies
  async resumeContext() {
      if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
      }
  }

  get context() { return this.audioCtx; }
  get masterOut() { return this.masterGain; }

  public getSpectrumData(): Uint8Array {
      const dataArray = new Uint8Array(this.masterAnalyzer.frequencyBinCount);
      this.masterAnalyzer.getByteFrequencyData(dataArray);
      return dataArray;
  }

  /**
   * Physically fetches a payload stream and decodes the PCM boundaries into a hardware AudioBuffer.
   */
  async loadTrackBuffer(url: string): Promise<AudioBuffer> {
      if (this.audioBuffers.has(url)) {
          return this.audioBuffers.get(url)!;
      }

      console.log(`[AudioEngine] Downloading layout payload... ${url}`);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      console.log(`[AudioEngine] Decoding discrete PCM samples...`);
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(url, audioBuffer);
      return audioBuffer;
  }

  trackActiveNode(node: AudioBufferSourceNode) {
      this.activeNodes.push(node);
  }
  
  /**
   * Silently constructs an OfflineAudioContext natively duplicating the timeline tracks
   * strictly to process offline hardware bounces into global Blob streams.
   */
  async exportTimeline(dawTracks: any[], durationSeconds: number): Promise<Blob> {
      console.log(`[AudioEngine] Spawning generic 16-bit WAV bounce engine: ${durationSeconds}sec`);
      
      const offlineCtx = new OfflineAudioContext(2, 44100 * durationSeconds, 44100);
      const offlineMaster = offlineCtx.createGain();
      offlineMaster.connect(offlineCtx.destination);
      
      dawTracks.forEach(trk => {
          if (trk.isMuted) return;
          
          const tGain = offlineCtx.createGain();
          tGain.gain.value = trk.volume / 100;
          const tPan = offlineCtx.createStereoPanner();
          tPan.pan.value = trk.pan / 50;
          
          tPan.connect(tGain);
          tGain.connect(offlineMaster);
          
          trk.clips.forEach((clip: any) => {
              if (clip.buffer) {
                  const source = offlineCtx.createBufferSource();
                  source.buffer = clip.buffer;
                  source.connect(tPan);
                  source.start(Math.max(0, (clip.startPx - 50) / 10));
              }
          });
      });
      
      const bounceBuffer = await offlineCtx.startRendering();
      return this.encodeWAV(bounceBuffer);
  }

  private encodeWAV(buffer: AudioBuffer): Blob {
      let numChannels = buffer.numberOfChannels;
      let sampleRate = buffer.sampleRate;
      let result = new Float32Array(buffer.length * numChannels);
      
      for(let i = 0; i < buffer.length; i++) {
         for(let c = 0; c < numChannels; c++) {
              result[i * numChannels + c] = buffer.getChannelData(c)[i];
         }
      }
      
      let wavBuffer = new ArrayBuffer(44 + result.length * 2);
      let view = new DataView(wavBuffer);
      let writeString = (view: DataView, offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
      };
      
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + result.length * 2, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, result.length * 2, true);
      
      let offset = 44;
      for (let i = 0; i < result.length; i++, offset += 2) {
          let s = Math.max(-1, Math.min(1, result[i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      
      return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * Spawns an isolated node pointer mapping to the provided Timeline offsets.
   */
  scheduleNode(buffer: AudioBuffer, contextTime: number, offsetTime: number, duration?: number): AudioBufferSourceNode {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      
      // Default straight to master for now. We will wire individual Track Chains later.
      source.connect(this.masterGain);
      
      if (duration) {
          source.start(contextTime, offsetTime, duration);
      } else {
          source.start(contextTime, offsetTime);
      }
      
      this.trackActiveNode(source);
      return source;
  }

  /**
   * Halts all active Timeline transport chains safely.
   */
  stopAll() {
      this.activeNodes.forEach(node => {
          try { node.stop(); } catch(e) {}
          node.disconnect();
      });
      this.activeNodes = [];
  }
}
