import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'privacy', loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyModule) },
  { path: 'terms', loadChildren: () => import('./pages/terms/terms.module').then(m => m.TermsModule) },
  { path: 'support', loadChildren: () => import('./pages/support/support.module').then(m => m.SupportModule) },
  { path: 'library', loadChildren: () => import('./pages/library/library.module').then(m => m.LibraryModule) },
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule) },
  { path: '', loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
