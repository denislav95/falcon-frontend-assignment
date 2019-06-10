import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from "./home/home.component";
import { DocsComponent } from "./docs/docs.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'docs', component: DocsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
