import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route } from '../core/route.service';
import { extract } from '../core/i18n.service';
import { RequestAccessComponent } from './request-access.component';

const routes: Routes = Route.withShell([
  { path: 'new-access', component: RequestAccessComponent, data: { title: extract('global.newAccess') } }
]);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class RequestAccessRoutingModule { }
