import {Component, ViewContainerRef} from "@angular/core";
import {Router, RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {HTTP_PROVIDERS} from "@angular/http";
import "rxjs/Rx";
import {GetStartedComponent} from "./get-started/get-started.component";
import {DateRangeComponent} from "./date-range/date-range.component";
import {LocationsComponent} from "./locations/locations.component";
import {SpeciesComponent} from "./species/species.component";
import {PhenophasesComponent} from "./phenophases/phenophases.component";
import {PartnerGroupsComponent} from "./partner-groups/partner-groups.component";
import {IntegratedDatasetsComponent} from "./integrated-datasets/integrated-datasets.component";
import {OutputFieldsComponent} from "./output-fields/output-fields.component";
import {AncillaryDataComponent} from "./ancillary-data/ancillary-data.component";
import {MetadataComponent} from "./metadata/metadata.component";
import {HelpComponent} from "./help/help.component";
import {DownloadComponent} from "./download/download.component";
import {NpnPortalService} from "./npn-portal.service";
import {DateService} from "./date-range/date.service";
// import {Modal, MODAL_PROVIDERS} from 'angular2-modal';
import {LocationsService} from "./locations/locations.service";
import {SpeciesService} from "./species/species.service";
import {PhenophasesService} from "./phenophases/phenophases.service";
import {OutputFieldsService} from "./output-fields/output-fields.service";
import {PartnerGroupsService} from "./partner-groups/partner-groups.service";
import {IntegratedDatasetService} from "./integrated-datasets/integrated-datasets.service";
import {AncillaryDataService} from "./ancillary-data/ancillary-data.service";

@Component({
  selector: 'my-app',
  template: `
      <div id="pagewrap1">
      <header>
        <h1>Phenology Observation Portal</h1>
      </header>
     

      <section id="content1">
        <div class="btn-group-vertical btn-block" role="group" aria-label="...">
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('GetStarted')" (click)="onSelect('GetStarted')">Get Started</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('DateRange')" [class.disabled]="!reportTypeSelected()" (click)="onSelect('DateRange')">Date Range</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('Locations')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('Locations')">Locations</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('Species')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('Species')">Species</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('Phenophases')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('Phenophases')">Phenophases</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('PartnerGroups')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('PartnerGroups')">Partner Groups</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('IntegratedDatasets')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('IntegratedDatasets')">Integrated Datasets</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('OutputFields')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('OutputFields')">Output Fields</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('AncillaryData')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('AncillaryData')">Ancillary Data</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('Metadata')" (click)="onSelect('Metadata')">Metadata</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('Help')" (click)="onSelect('Help')">Help</button>
        </div>

      </section>

      <section id="middle1">
        <router-outlet></router-outlet>
      </section>

      <aside id="sidebar1">
        <download></download>
      </aside>

      <footer>
        <!--<h4>Footer</h4>-->
        <!--<p>Do we want this footer for anything or remove it?</p>-->
      </footer>

    </div>
  `,
  providers: [NpnPortalService, DateService, LocationsService, SpeciesService, PhenophasesService, PartnerGroupsService, IntegratedDatasetService, OutputFieldsService, AncillaryDataService, HTTP_PROVIDERS],
  directives: [ROUTER_DIRECTIVES, DownloadComponent]
})
@RouteConfig([

  {path: '/get-started', name: 'GetStarted', component: GetStartedComponent, useAsDefault: true},
  {path: '/date-range',  name: 'DateRange',  component: DateRangeComponent},
  {path: '/locations',   name: 'Locations',  component: LocationsComponent},
  {path: '/species',   name: 'Species',  component: SpeciesComponent},
  {path: '/phenophases',   name: 'Phenophases',  component: PhenophasesComponent},
  {path: '/partner-groups',   name: 'PartnerGroups',  component: PartnerGroupsComponent},
  {path: '/integrated-datasets',   name: 'IntegratedDatasets',  component: IntegratedDatasetsComponent},
  {path: '/output-fields',   name: 'OutputFields',  component: OutputFieldsComponent},
  {path: '/ancillary-data',   name: 'AncillaryData',  component: AncillaryDataComponent},
  {path: '/metadata',   name: 'Metadata',  component: MetadataComponent},
  {path: '/help',   name: 'Help',  component: HelpComponent}
])
export class AppComponent {
    constructor(private _npnPortalService: NpnPortalService, 
                private _dateService: DateService,
                private _locationsService: LocationsService,
                private _speciesService: SpeciesService,
                private _phenophasesService: PhenophasesService,
                private _partnerGroupsService: PartnerGroupsService,
                private _integratedDatasetService: IntegratedDatasetService,
                private _outputFieldsService: OutputFieldsService,
                private _ancillaryDataService: AncillaryDataService,
                private _router: Router) {
    }

    onSelect(page) {
        if(page == "GetStarted" || page == "Metadata" || page == "Help") {
            this._npnPortalService.activePage = page;
            this._router.navigate( [page] );
        }
        else {
            if (page === "DateRange" && this.reportTypeSelected()) {
                this._npnPortalService.activePage = page;
                this._router.navigate( [page] );
            }
            if (this.reportTypeSelected() && this.validDateRange()) {
                this._npnPortalService.activePage = page;
                this._router.navigate( [page] );
            }
        }

    }

    reportTypeSelected() {
        return this._npnPortalService.reportTypeSelected()
    }

    validDateRange() {
        return this._npnPortalService.dateRangeIsValid();
    }

    isSelected(page) {
        return page == this._npnPortalService.activePage
    }

    ngOnInit() {
        this._locationsService.initStates();
        this._speciesService.initSpecies();
        this._speciesService.initFunctionalTypes();
        this._partnerGroupsService.initPartnerGroups();
        this._phenophasesService.initPhenophases();
        this._outputFieldsService.initRawFields();
        this._outputFieldsService.initSummarizedFields();
        this._outputFieldsService.initSiteLevelSummarizedFields();
    }
}
