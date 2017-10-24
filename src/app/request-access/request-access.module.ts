import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RequestAccessRoutingModule } from './request-access-routing.module';
import { RequestAccessComponent } from './request-access.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RequestAccessRoutingModule
  ],
  declarations: [RequestAccessComponent]
})
export class RequestAccessModule { }
