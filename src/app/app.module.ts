import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { StudioComponent } from './pages/studio/studio.component';
import { LibraryComponent } from './pages/library/library.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { SupportComponent } from './pages/support/support.component';
import { WaveformComponent } from './components/waveform/waveform.component';
import { VerifyComponent } from './pages/auth/verify/verify.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DialogComponent } from './components/dialog/dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    StudioComponent,
    LibraryComponent,
    DashboardComponent,
    PrivacyComponent,
    TermsComponent,
    SupportComponent,
    WaveformComponent,
    VerifyComponent,
    ChatbotComponent,
    ProfileComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
