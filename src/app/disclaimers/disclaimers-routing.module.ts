import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route } from '../core/route.service';
import { extract } from '../core/i18n.service';
import { DisclaimersComponent } from './disclaimers.component';

const routes: Routes = Route.withShell([
  { path: 'disclaimers', component: DisclaimersComponent, data: { title: extract('global.disclaimers') } }
]);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DisclaimersRoutingModule { }
