import {Component, ViewChild}     from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
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
                private _router: Router
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
    
    getDownloadStatus() {
        return this._npnPortalService.downloadStatus;
    }
    
    getDataPrecision() {
        return this._npnPortalService.dataPrecision;
    }

    getDownloadType(){
        if(this._npnPortalService.downloadType == "siteLevelSummarized")
            return "Site Level Summarized";
        else if(this._npnPortalService.downloadType == "raw")
            return "Raw";
        else if(this._npnPortalService.downloadType == "summarized")
            return "Individual Level Summarized";
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

    submitActivePage() {
        if(this._npnPortalService.activePage === 'Locations')
            this._locationService.submitLocations();
        else if(this._npnPortalService.activePage === 'Species')
            this._speciesService.submitSpecies();
        else if(this._npnPortalService.activePage === 'Phenophases')
            this._phenophaseService.submitPhenophases();
        else if(this._npnPortalService.activePage === 'PartnerGroups')
            this._partnerGroupsService.submitGroups();
        else if(this._npnPortalService.activePage === 'IntegratedDatasets')
            this._integratedDatasetService.submitDatasets();
        else if(this._npnPortalService.activePage === 'OutputFields')
            this._outputFieldsService.submitOptionalFields();
        else if(this._npnPortalService.activePage === 'AncillaryData')
            this._ancillaryDataService.submitAncillaryData();
    }
}