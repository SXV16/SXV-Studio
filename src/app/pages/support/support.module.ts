import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SupportComponent } from './support.component';

const routes: Routes = [
  { path: '', component: SupportComponent }
];

@NgModule({
  declarations: [
    SupportComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SupportModule { }
