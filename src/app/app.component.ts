import {Component} from "@angular/core";
import {Router} from '@angular/router';
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
import {PersistentSearchService, savedSearch} from "./persistent-search.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  // PersistentSearchService is deliberately NOT re-provided here. It's already in AppModule's
  // providers, and listing it again would give this component its own instance - one that
  // OutputFieldsService, being module-provided, could never see. That split is why restored
  // output-field selections never reached the service that consumes them.
  providers: [
      DateService,
      LocationsService,
      SpeciesService,
      PhenophasesService,
      PartnerGroupsService,
      IntegratedDatasetService,
      AncillaryDataService
    ]
})
export class AppComponent {
    constructor(private _npnPortalService: NpnPortalService, 
                private _persistentSearchService: PersistentSearchService,
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
            && this._outputFieldsService.fieldsReady(this._npnPortalService.downloadType)
            && this._integratedDatasetService.ready
    }

    initializeData() {
        this._locationsService.initStates();
        this._speciesService.initSpecies();
        this._speciesService.initFunctionalTypes();
        this._partnerGroupsService.initPartnerGroups();
        this._phenophasesService.initPhenophases();
        this.initOutputFields();
        this._integratedDatasetService.initDatasets();
        this._ancillaryDataService.initDatasheets();
    }

    // Only fires when a saved search restored a download type. On a cold start the type is
    // still null and get-started's setDownloadType() drives the load, as it does today.
    private initOutputFields() {
        switch (this._npnPortalService.downloadType) {
            case 'raw':                 this._outputFieldsService.initRawFields(); break;
            case 'summarized':          this._outputFieldsService.initSummarizedFields(); break;
            case 'siteLevelSummarized': this._outputFieldsService.initSiteLevelSummarizedFields(); break;
            case 'magnitude':           this._outputFieldsService.initMagnitudeFields(); break;
        }
    }
    
    ngOnInit() {
        let searchId = this._persistentSearchService.getSearchId();
        if(!searchId) {
            this.initializeData();
            return;
        }
        this._persistentSearchService.getSearch(searchId).subscribe(
            (savedSearch: savedSearch) => {
                this.applySavedSearch(savedSearch);
                this.initializeData();
            },
            (error) => {
                // A stale, malformed (400) or missing (404) hash must not strand the user on the
                // loading screen - fall through to a normal empty session.
                console.warn('Could not load saved search "' + searchId + '"', error);
                this.initializeData();
            });
    }

    //set all our model data using the returned JSON
    private applySavedSearch(savedSearch: savedSearch) {
        // The service stores and returns the search verbatim, so a junk record must not throw.
        if(!savedSearch || !savedSearch.downloadType)
            return;

        this._npnPortalService.downloadType = savedSearch.downloadType;
        if(savedSearch.downloadType === 'selectable')
            this._npnPortalService.allowDownloadTypeChangeWithoutReset = true;
        if (savedSearch.startDate) {
            this._dateService.startDate = savedSearch.startDate;
            this._npnPortalService.startDate = savedSearch.startDate;
        }
        if (savedSearch.endDate) {
            this._dateService.endDate = savedSearch.endDate;
            this._npnPortalService.endDate = savedSearch.endDate;
        }
        if(savedSearch.dataPrecision) {
            this._dateService.dataPrecision = savedSearch.dataPrecision;
            this._npnPortalService.dataPrecision = savedSearch.dataPrecision;
        }
        if(savedSearch.startYear) {
            this._dateService.startYear = savedSearch.startYear;
            this._npnPortalService.startYear = savedSearch.startYear;
        }
        if(savedSearch.startMonth) {
            this._dateService.startMonth = savedSearch.startMonth;
            this._npnPortalService.startMonth = savedSearch.startMonth;
        }
        if(savedSearch.startDay) {
            this._dateService.startDay = savedSearch.startDay;
            this._npnPortalService.startDay = savedSearch.startDay;
        }
        if(savedSearch.endYear) {
            this._dateService.endYear = savedSearch.endYear;
            this._npnPortalService.endYear = savedSearch.endYear;
        }
        if(savedSearch.endMonth) {
            this._dateService.endMonth = savedSearch.endMonth;
            this._npnPortalService.endMonth = savedSearch.endMonth;
        }
        if(savedSearch.endDay) {
            this._dateService.endDay = savedSearch.endDay;
            this._npnPortalService.endDay = savedSearch.endDay;
        }
        if(savedSearch.stations)
            this._npnPortalService.stations = savedSearch.stations;

        this._persistentSearchService.states = savedSearch.states;
        this._persistentSearchService.species = savedSearch.species;
        this._persistentSearchService.phenophases = savedSearch.phenophases;
        this._persistentSearchService.partnerGroups = savedSearch.partnerGroups;
        this._persistentSearchService.datasets = savedSearch.datasets;
        this._persistentSearchService.optionalFieldGroups = savedSearch.optionalFieldGroups;
        this._persistentSearchService.datasheets = savedSearch.datasheets;

        if(savedSearch.searchSource === 'visualization-tool') {
            this._npnPortalService.fromVizTool = true;
        }
    }
}
