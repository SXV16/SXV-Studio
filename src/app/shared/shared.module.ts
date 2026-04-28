import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WaveformComponent } from '../components/waveform/waveform.component';
import { ChatbotComponent } from '../components/chatbot/chatbot.component';
import { DialogComponent } from '../components/dialog/dialog.component';

@NgModule({
  declarations: [
    WaveformComponent,
    ChatbotComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WaveformComponent,
    ChatbotComponent,
    DialogComponent
  ]
})
export class SharedModule { }
