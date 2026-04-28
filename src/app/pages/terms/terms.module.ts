import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TermsComponent } from './terms.component';

const routes: Routes = [
  { path: '', component: TermsComponent }
];

@NgModule({
  declarations: [
    TermsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TermsModule { }
