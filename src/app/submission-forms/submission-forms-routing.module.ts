import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route } from '../core/route.service';
import { extract } from '../core/i18n.service';
import { SubmissionFormsComponent } from './submission-forms.component';

const routes: Routes = Route.withShell([
  { path: 'submission-form', component: SubmissionFormsComponent, data: { title: extract('global.submissionForm') } }
]);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SubmissionFormsRoutingModule { }
