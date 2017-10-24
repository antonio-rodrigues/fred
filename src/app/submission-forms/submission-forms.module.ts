import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SubmissionFormsRoutingModule } from './submission-forms-routing.module';
import { SubmissionFormsComponent } from './submission-forms.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SubmissionFormsRoutingModule
  ],
  declarations: [
    SubmissionFormsComponent
  ]
})
export class SubmissionFormsModule { }
