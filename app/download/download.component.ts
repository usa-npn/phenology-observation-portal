import {Component, ViewChild}     from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from '../npn-portal.service';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {LocationsService} from "../locations/locations.service";
import {PartnerGroupsService} from "../partner-groups/partner-groups.service";
import {SpeciesService} from "../species/species.service";
import {PhenophasesService} from "../phenophases/phenophases.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";
import {IntegratedDatasetService} from "../integrated-datasets/integrated-datasets.service";
import {AncillaryDataService} from "../ancillary-data/ancillary-data.service";
import {DateService} from "../date-range/date.service";
import {PersistentSearchService} from "../persistent-search.service";
import {Response} from "@angular/http";
import {Config} from "../config.service";

@Component({
    selector: 'download',
    templateUrl: 'app/download/download.html',
    styleUrls: ['app/download/download.css'],
    directives: [ROUTER_DIRECTIVES, MODAL_DIRECTIVES]
})
export class DownloadComponent {
    constructor(private _npnPortalService: NpnPortalService,
                private _dateService: DateService,
                private _locationService: LocationsService,
                private _speciesService: SpeciesService,
                private _phenophaseService: PhenophasesService,
                private _partnerGroupsService: PartnerGroupsService,
                private _integratedDatasetService: IntegratedDatasetService,
                private _outputFieldsService: OutputFieldsService,
                private _ancillaryDataService: AncillaryDataService,
                private _router: Router,
                private _persistentSearchService: PersistentSearchService,
                private _configService: Config
    ) {}

    @ViewChild('citationModal')
    citationModal: ModalComponent;

    @ViewChild('noDateModal')
    noDateModal: ModalComponent;

    @ViewChild('noFiltersModal')
    noFiltersModal: ModalComponent;

    @ViewChild('downloadModal')
    downloadModal: ModalComponent;
    
    hasAgreed:boolean = false;
    savedSearchUrl:string = "";
    showSavedSearch:boolean = false;
    
    getDownloadStatus() {
        return this._npnPortalService.downloadStatus;
    }
    
    getDataPrecision() {
        return this._npnPortalService.dataPrecision;
    }

    getDownloadType(){
        if(this._npnPortalService.downloadType == "siteLevelSummarized")
            return "Site Phenometrics";
        else if(this._npnPortalService.downloadType == "raw")
            return "Status and Intensity";
        else if(this._npnPortalService.downloadType == "summarized")
            return "Individual Phenometrics";
    }
    
    downloadTypeIsSet() {
        return this._npnPortalService.reportTypeSelected();
    }

    dateRangeIsValid() {
        return this._npnPortalService.dateRangeIsValid();
    }
    
    getSelectedDate() {
        return this._npnPortalService.getDateFilter();
    }
    
    getSelectedStates() {
        return this._npnPortalService.getSelectedStates();
    }

    getSelectedPartnerGroups() {
        return this._npnPortalService.getSelectedPartnerGroups();
    }
    
    getSelectedIntegratedDatasets() {
        return this._npnPortalService.getSelectedDatasets();
    }

    getSelectedSpecies() {
        return this._npnPortalService.getSelectedSpecies();
    }

    getSelectedPhenophases() {
            return this._npnPortalService.getSelectedPhenophases();
    }

    getSelectedExtent() {
        return this._npnPortalService.getSelectedExtent();
    }
    
    getObservationCount() {
        return this._npnPortalService.observationCount
    }

    getSelectedOptionalFields() {
        return this._npnPortalService.getSelectedOptionalFields();
    }
    
    getSelectedAncillaryData() {
        return this._npnPortalService.getSelectedDatasheets();
    }

    removeState(state) {
        this._locationService.removeState(state);
        this._locationService.submitLocations();
    }

    removeSpecies(species) {
        this._speciesService.removeSpecies(species);
        this._speciesService.submitSpecies();
    }

    removePhenophase(phenophase) {
        this._phenophaseService.removePhenophase(phenophase);
        this._phenophaseService.submitPhenophases();
    }
    
    removePartnerGroup(group) {
        this._partnerGroupsService.removeGroup(group);
    }
    
    removeIntegratedDataset(dataset) {
        this._integratedDatasetService.removeDataset(dataset);
    }
    
    removeOptionalField(optionalField) {
        this._outputFieldsService.removeOptionalField(optionalField);
    }
    
    removeAncillaryData(datasheet) {
        this._ancillaryDataService.removeAncillaryData(datasheet);
    }
    
    download() {
        this.submitActivePage();
        if(!this.hasAgreed) {
            this.citationModal.open();
        }
        else if(this._npnPortalService.getDateFilter() == ''
            && !this._npnPortalService.dataPrecision
            && this._npnPortalService.getSelectedStates().length == 0
            && !this._npnPortalService.getSelectedExtent().bottom_left_x1
            && this._npnPortalService.getSelectedSpecies().length == 0
            && this._npnPortalService.getSelectedPhenophases().length == 0
            && this._npnPortalService.getSelectedPartnerGroups().length == 0
            && this._npnPortalService.getSelectedDatasets().length == 0
            && this._npnPortalService.getSelectedOptionalFields().length == 0
            // && this._npnPortalService.getSelectedDatasheets().length == 0
        ) {
            this.noFiltersModal.open();
        }
        // else if(!this._npnPortalService.startDate || !this._npnPortalService.endDate) {
        //    this.noDateModal.open();
        // }
        else {
            this.continueDownload();
        }
    }
    
    continueDownload() {
        this.downloadModal.open('lg');
        this._npnPortalService.download();
    }
    
    resetFilters(page: string) {
        this._npnPortalService.resettingFilters = true;
        this.closeSavedSearch();
        this._dateService.reset();
        this._locationService.reset();
        this._speciesService.reset();
        this._phenophaseService.reset();
        this._partnerGroupsService.reset();
        this._integratedDatasetService.reset();
        this._outputFieldsService.reset();
        this._ancillaryDataService.reset();
        this._npnPortalService.reset();
        this._router.navigate( [page] );
    }

    copyToClipboard(element) {
        element.select();
        document.execCommand("copy");
    }

    submitActivePage() {
        if(this._npnPortalService.activePage === 'locations')
            this._locationService.submitLocations();
        else if(this._npnPortalService.activePage === 'species')
            this._speciesService.submitSpecies();
        else if(this._npnPortalService.activePage === 'phenophases')
            this._phenophaseService.submitPhenophases();
        else if(this._npnPortalService.activePage === 'partner-groups')
            this._partnerGroupsService.submitGroups();
        else if(this._npnPortalService.activePage === 'integrated-datasets')
            this._integratedDatasetService.submitDatasets();
        else if(this._npnPortalService.activePage === 'output-fields')
            this._outputFieldsService.submitOptionalFields();
        else if(this._npnPortalService.activePage === 'ancillary-data')
            this._ancillaryDataService.submitAncillaryData();
    }
    
    closeSavedSearch() {
        this.showSavedSearch = false;
    }
    
     saveSearch() {
         let savedSearch = {
             downloadType: this._npnPortalService.downloadType,
             startDate: this._npnPortalService.startDate,
             endDate: this._npnPortalService.endDate,
             species: this._npnPortalService.getSelectedSpecies().map((species) => species.species_id),
             states: this._npnPortalService.getSelectedStates().map((state) => state.state_id),
             phenophases: this._npnPortalService.getSelectedPhenophases().map((phenophase) => phenophase.phenophase_id),
             partnerGroups: this._npnPortalService.getSelectedPartnerGroups().map((group) => group.network_id),
             datasets: this._npnPortalService.getSelectedDatasets().map((dataset) => dataset.dataset_id),
             optionalFields: this._npnPortalService.getSelectedOptionalFields().map((field) => field.metadata_field_id),
             datasheets: this._npnPortalService.getSelectedDatasheets().map((datasheet) => datasheet.id),
             dataPrecision: this._npnPortalService.dataPrecision,
             rangeType: this._npnPortalService.rangeType,
             startDay: this._npnPortalService.startDay,
             endDay: this._npnPortalService.endDay,
             startMonth: this._npnPortalService.startMonth,
             endMonth: this._npnPortalService.endMonth,
             startYear: this._npnPortalService.startYear,
             endYear: this._npnPortalService.endYear
         };
         this._persistentSearchService.saveSearch(savedSearch).subscribe((res:Response) => {
             if(res.json().download_path === "error") {
                 console.log('error saving search');
             }
             else {
                 this.savedSearchUrl = this._configService.getPopUrl() + '?search=' + res.json().saved_search_hash;
                 this.showSavedSearch = true;
             }
         });
     }
}