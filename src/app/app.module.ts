import { RequestAccessModule } from './request-access/request-access.module';
import { multicast } from 'rxjs/operator/multicast';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { D3Service } from 'd3-ng2-service';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AboutModule } from './about/about.module';
import { ContactModule } from './contact/contact.module';
import { DisclaimersModule } from './disclaimers/disclaimers.module';
import { FaqModule } from './faq/faq.module';
import { HomeModule } from './home/home.module';
import { LoginModule } from './login/login.module';
import { MapModule } from './map/map.module';
import { SubmissionFormsModule } from './submission-forms/submission-forms.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    TranslateModule.forRoot(),
    NgbModule.forRoot(),
    CoreModule,
    SharedModule,
    HomeModule,
    AboutModule,
    LoginModule,
    MapModule,
    AppRoutingModule,
    FaqModule,
    DisclaimersModule,
    ContactModule,
    SubmissionFormsModule,
    RequestAccessModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    D3Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
