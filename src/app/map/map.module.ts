import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { MapService } from './map.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    MapRoutingModule
  ],
  declarations: [
    MapComponent
  ],
  providers: [
    MapService
  ]
})

export class MapModule { }
