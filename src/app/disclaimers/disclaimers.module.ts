import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { DisclaimersRoutingModule } from './disclaimers-routing.module';
import { DisclaimersComponent } from './disclaimers.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    DisclaimersRoutingModule
  ],
  declarations: [DisclaimersComponent]
})
export class DisclaimersModule { }
