import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  isVisible = false;
  userInput = '';
  messages: ChatMessage[] = [
      { role: 'bot', text: 'Hello! I am your Master AI. I can analyze tracks, offer EQ tips, or help you with your mix. How can I assist?' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this.authService.currentUser$.subscribe(user => {
          this.isVisible = user?.tier === 'Pro DJ';
      });
  }

  toggleChat() {
      this.isOpen = !this.isOpen;
  }

  sendMessage() {
      if (!this.userInput.trim()) return;

      this.messages.push({ role: 'user', text: this.userInput });
      const query = this.userInput.toLowerCase();
      this.userInput = '';

      setTimeout(() => {
          let reply = "I'm sorry, I'm analyzing your request but I need a bit more context. Try asking me about Recording, the Editor, Mixing, or specific effects like EQ and Compression!";
          
          if (query.includes('record') || query.includes('mic') || query.includes('vocal')) {
              reply = "To record vocals or instruments in SXV Studio, head over to the 'Record' tab on the left sidebar. Ensure your microphone is selected in the Input Source dropdown, and smash the big red record button!";
          } else if (query.includes('editor') || query.includes('cut') || query.includes('split') || query.includes('trim')) {
              reply = "To arrange and edit, jump into the 'Editor' tab! There you can trim, split, and time-stretch clips on the timeline. Selecting a track on the left unlocks its dedicated Channel Strip and DSP FX Rack.";
          } else if (query.includes('library') || query.includes('upload') || query.includes('import')) {
              reply = "You can upload new audio files by clicking '+ UPLOAD AUDIO' inside the 'Library' tab. You can also drag these tracks directly into your Mixer or Editor timelines!";
          } else if (query.includes('mixer') || query.includes('volume') || query.includes('fader') || query.includes('pan')) {
              reply = "The Mixer tab gives you a full hardware DAW view. You can adjust volume faders, tweak panning dials (L/R), and engage Mute or Solo for each track to get the perfect balance.";
          } else if (query.includes('save') || query.includes('export') || query.includes('download')) {
              reply = "To save your session, look for the 'SAVE AUDIO' button in the Editor or Mixer. If you simply want to download a track offline, use the download arrow in the Library tab.";
          } else if (query.includes('eq') || query.includes('equalizer')) {
              reply = "For EQ, select your track in the Editor and use the Parametric EQ in the DSP Rack. Try cutting muddy ranges around 300Hz, and add a high-shelf boost at 10kHz for crispy vocals!";
          } else if (query.includes('compress') || query.includes('glue') || query.includes('loud')) {
              reply = "Compression reduces the dynamic range. Dial up the compressor in the DSP Rack to tame vocal peaks. On the Master bus, subtle compression acts like 'glue' tying the mix elements together.";
          } else if (query.includes('reverb') || query.includes('delay') || query.includes('echo')) {
              reply = "Spice up your tracks with spatial FX! In the Editor's right-side DSP Rack, dial up the Reverb or Delay knobs. This runs the signal through a parallel wet bus, creating beautiful expansive echoes.";
          } else if (query.includes('pitch') || query.includes('tune')) {
              reply = "Need pitch correction? Open the Editor, select a track with a clip, and hit the '🎵 Fix Pitch' smart action at the top to process the buffer through our offline native SoundTouch algorithms!";
          } else if (query.includes('kick') || query.includes('bass')) {
              reply = "Make sure the kick and bass aren't overlapping too much! Use the EQ to carve out a pocket in the bass frequencies (around 60Hz) so the kick punch can snap through effortlessly.";
          } else if (query.includes('master') || query.includes('loud')) {
              reply = "To get a louder master, use a multipressor to catch peaks, then push an adaptive limiter to -0.1 dB ceiling.";
          }

          this.messages.push({ role: 'bot', text: reply });
      }, 1000);
  }
}

