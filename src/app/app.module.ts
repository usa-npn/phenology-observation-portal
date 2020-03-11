import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AvailabilityPipe } from './ancillary-data/availability-pipe';
import { SearchPipe } from './partner-groups/search-pipe';
import { PhenophasePipe } from './phenophases/phenophase-pipe';
import { SortPipe } from './species/sort-pipe';
import { DownloadComponent } from './download/download.component';
import { DatePicker, DateRangeComponent } from './date-range/date-range.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { LocationsComponent } from './locations/locations.component';
import { SpeciesComponent } from './species/species.component';
import { PhenophasesComponent } from './phenophases/phenophases.component';
import { PartnerGroupsComponent } from './partner-groups/partner-groups.component';
import { IntegratedDatasetsComponent } from './integrated-datasets/integrated-datasets.component';
import { OutputFieldsComponent } from './output-fields/output-fields.component';
import { AncillaryDataComponent } from './ancillary-data/ancillary-data.component';
import { MetadataComponent } from './metadata/metadata.component';
import { HelpComponent } from './help/help.component';
import { BsModalModule } from 'ng2-bs3-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { SpeciesSearchPipe } from './species/search-pipe';
import { Config } from './config.service';
import { NpnPortalService } from './npn-portal.service';
import { ActivateGuard } from './activate.guard';
import { DeactivateDateRangeGuard } from './date-range/deactivate-date-range.gaurd';
import { DeactivateGuard } from './deactivate.guard';
import { OutputFieldsService } from './output-fields/output-fields.service';
import { PersistentSearchService } from './persistent-search.service';


@NgModule({
  declarations: [
    AppComponent,
    AvailabilityPipe,
    SearchPipe,
    SpeciesSearchPipe,
    PhenophasePipe,
    SortPipe,
    DownloadComponent,
    DatePicker,
    GetStartedComponent,
    DateRangeComponent,
    LocationsComponent,
    SpeciesComponent,
    PhenophasesComponent,
    PartnerGroupsComponent,
    IntegratedDatasetsComponent,
    OutputFieldsComponent,
    AncillaryDataComponent,
    MetadataComponent,
    HelpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BsModalModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    SearchPipe
  ],
  providers: [
    Config,
    OutputFieldsService,
    PersistentSearchService,
    NpnPortalService,
    ActivateGuard,
    DeactivateGuard,
    DeactivateDateRangeGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// import {bootstrap}        from '@angular/platform-browser-dynamic';
// import {AppComponent}     from './app.component';
// import {appRouterProviders} from './app.routes';
// import {DeactivateGuard} from "./deactivate.guard";
// import {ActivateGuard} from "./activate.guard";
// import {NpnPortalService} from "./npn-portal.service";
// import {HTTP_PROVIDERS} from "@angular/http";
// import {Config} from "./config.service";
// import {DeactivateDateRangeGuard} from "./date-range/deactivate-date-range.gaurd";

// bootstrap(AppComponent, [
//     HTTP_PROVIDERS, 
//     appRouterProviders, 
//     Config, 
//     NpnPortalService, 
//     DeactivateGuard, 
//     ActivateGuard, 
//     DeactivateDateRangeGuard
// ]);
