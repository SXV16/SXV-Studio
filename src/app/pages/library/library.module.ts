import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LibraryComponent } from './library.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: LibraryComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    LibraryComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class LibraryModule { }
