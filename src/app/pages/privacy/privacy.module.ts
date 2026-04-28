import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PrivacyComponent } from './privacy.component';

const routes: Routes = [
  { path: '', component: PrivacyComponent }
];

@NgModule({
  declarations: [
    PrivacyComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PrivacyModule { }
