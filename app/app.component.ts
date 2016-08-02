import {Component} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import "rxjs/Rx";
import {DownloadComponent} from "./download/download.component";
import {NpnPortalService} from "./npn-portal.service";
import {DateService} from "./date-range/date.service";
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
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('get-started')" (click)="onSelect('/get-started')">Get Started</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('date-range')" [class.disabled]="!reportTypeSelected()" (click)="onSelect('date-range')">Date Range</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('locations')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('locations')">Locations</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('species')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('species')">Species</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('phenophases')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('phenophases')">Phenophases</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('partner-groups')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('partner-groups')">Partner Groups</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('integrated-datasets')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('integrated-datasets')">Integrated Datasets</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('output-fields')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('output-fields')">Output Fields</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('ancillary-data')" [class.disabled]="!(reportTypeSelected() && validDateRange())" (click)="onSelect('ancillary-data')">Ancillary Data</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('metadata')" [class.disabled]="!allDataLoaded()" (click)="onSelect('metadata')">Metadata</button>
          <button type="button" class="btn btn-block btn-default" [class.active]="isSelected('help')" [class.disabled]="!allDataLoaded()" (click)="onSelect('help')">Help</button>
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
  providers: [DateService, LocationsService, SpeciesService, PhenophasesService, PartnerGroupsService, IntegratedDatasetService, OutputFieldsService, AncillaryDataService],
  directives: [ROUTER_DIRECTIVES, DownloadComponent]
})
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
        if(this.allDataLoaded()) {
            if(page == "get-started" || page == "metadata" || page == "help") {
                this._npnPortalService.activePage = page;
                this._router.navigate( [page] );
            }
            else {
                if (page === "date-range" && this.reportTypeSelected()) {
                    this._npnPortalService.activePage = page;
                    this._router.navigate( [page] );
                }
                if (this.reportTypeSelected() && this.validDateRange()) {
                    this._npnPortalService.activePage = page;
                    this._router.navigate( [page] );
                }
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

    allDataLoaded() {
        return this._locationsService.ready
            && this._phenophasesService.ready
            && this._speciesService.ready
            && this._partnerGroupsService.ready
            && this._outputFieldsService.rawFieldsReady
            && this._outputFieldsService.summarizedFieldsReady
            && this._outputFieldsService.siteLevelSummarizedFieldsReady
            && this._integratedDatasetService.ready
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
        this._integratedDatasetService.initDatasets();
    }
}
