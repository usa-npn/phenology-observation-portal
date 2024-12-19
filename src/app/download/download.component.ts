import { Component, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { NpnPortalService } from '../npn-portal.service';
import { LocationsService } from "../locations/locations.service";
import { PartnerGroupsService } from "../partner-groups/partner-groups.service";
import { SpeciesService } from "../species/species.service";
import { PhenophasesService } from "../phenophases/phenophases.service";
import { OutputFieldsService } from "../output-fields/output-fields.service";
import { IntegratedDatasetService } from "../integrated-datasets/integrated-datasets.service";
import { AncillaryDataService } from "../ancillary-data/ancillary-data.service";
import { DateService } from "../date-range/date.service";
import { PersistentSearchService } from "../persistent-search.service";
import { Config } from "../config.service";
import { BsModalComponent } from 'ng2-bs3-modal';
import { NpnUsageService } from '../services/npn-usage.service';  // Import the NpnUsageService

@Component({
    selector: 'download',
    templateUrl: 'download.html',
    styleUrls: ['download.css']
})
export class DownloadComponent {
    constructor(public _npnPortalService: NpnPortalService,
                private _dateService: DateService,
                private _locationService: LocationsService,
                private _speciesService: SpeciesService,
                private _phenophaseService: PhenophasesService,
                private _partnerGroupsService: PartnerGroupsService,
                private _integratedDatasetService: IntegratedDatasetService,
                public _outputFieldsService: OutputFieldsService,
                private _ancillaryDataService: AncillaryDataService,
                private _router: Router,
                private _persistentSearchService: PersistentSearchService,
                private _configService: Config,
                private npnUsageService: NpnUsageService  // Inject NpnUsageService
    ) {}

    @ViewChild('citationModal')
    citationModal: BsModalComponent;

    @ViewChild('noDateModal')
    noDateModal: BsModalComponent;

    @ViewChild('noFiltersModal')
    noFiltersModal: BsModalComponent;

    @ViewChild('downloadModal')
    downloadModal: BsModalComponent;

    hasAgreed: boolean = false;
    savedSearchUrl: string = "";
    showSavedSearch: boolean = false;

    getDownloadStatus() {
        return this._npnPortalService.downloadStatus;
    }

    getDataPrecision() {
        return this._npnPortalService.dataPrecision;
    }

    getPeriodInterest() {
        return (this._npnPortalService.periodInterest != null) ? 
            ((this._npnPortalService.periodInterest == 30) ? 
                "Monthly" : 
                this._npnPortalService.periodInterest + " Days"
            ) : 
            null;
    }

    getDownloadType() {
        if (this._npnPortalService.downloadType == "siteLevelSummarized")
            return "Site Phenometrics";
        else if (this._npnPortalService.downloadType == "raw")
            return "Status and Intensity";
        else if (this._npnPortalService.downloadType == "summarized")
            return "Individual Phenometrics";
        else if (this._npnPortalService.downloadType == "magnitude")
            return "Magnitude Phenometrics";
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
        return this._npnPortalService.observationCount;
    }

    getSelectedOptionalFields() {
        return this._outputFieldsService.getSelectedOptionalFields();
    }

    getSelectedAncillaryData() {
        return this._npnPortalService.getSelectedDatasheets();
    }

    // Insert a new row into npn_usage when Download is clicked
    insertNpnUsageRow() {
        // Determine the metric_id based on the value from getDownloadType
        let metricId;
        const downloadType = this.getDownloadType();
        switch (downloadType) {
            case 'Status and Intensity':
                metricId = 2;
                break;
            case 'Individual Phenometrics':
                metricId = 3;
                break;
            case 'Site Phenometrics':
                metricId = 4;
                break;
            case 'Magnitude Phenometrics':
                metricId = 5;
                break;
            default:
                console.log('Invalid download type, skipping metric_id update.');
                return; // Exit gracefully if no valid download type is found
        }

        const newUsage = {
            date_time: new Date().toISOString(),  // Current datetime in ISO format
            tool_id: 1,                           // Tool ID for this component (set to 1)
            metric_id: metricId                  // Metric ID determined dynamically
        };

        // Call the NpnUsageService to add the new row to the database
        this.npnUsageService.addNpnUsage(newUsage).subscribe(
            (response) => {
                console.log('New npn_usage row added:', response);
            },
            (error) => {
                console.error('Error adding npn_usage row:', error);
            }
        );
    }

    download() {
        this.insertNpnUsageRow();
        console.log('Download started');
        this.submitActivePage();
        if (!this.hasAgreed) {
            this.citationModal.open();
        } else if (this._npnPortalService.getDateFilter() == ''
            && !this._npnPortalService.dataPrecision
            && this._npnPortalService.getSelectedStates().length == 0
            && !this._npnPortalService.getSelectedExtent().bottom_left_x1
            && this._npnPortalService.getSelectedSpecies().length == 0
            && this._npnPortalService.getSelectedPhenophases().length == 0
            && this._npnPortalService.getSelectedPartnerGroups().length == 0
            && this._npnPortalService.getSelectedDatasets().length == 0
            && this._outputFieldsService.getSelectedOptionalFields().length == 0
        ) {
            console.log('here');
            this.noFiltersModal.open();
        } else if (!this._npnPortalService.startDate || !this._npnPortalService.endDate) {
            this.noDateModal.open();
        } else {
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
        this._router.navigate([page]);
    }

    copyToClipboard(element) {
        element.select();
        document.execCommand("copy");
    }

    submitActivePage() {
        if (this._npnPortalService.activePage === 'locations')
            this._locationService.submitLocations();
        else if (this._npnPortalService.activePage === 'species')
            this._speciesService.submitSpecies();
        else if (this._npnPortalService.activePage === 'phenophases')
            this._phenophaseService.submitPhenophases();
        else if (this._npnPortalService.activePage === 'partner-groups')
            this._partnerGroupsService.submitGroups();
        else if (this._npnPortalService.activePage === 'integrated-datasets')
            this._integratedDatasetService.submitDatasets();
        else if (this._npnPortalService.activePage === 'output-fields')
            this._outputFieldsService.submitOptionalFields();
        else if (this._npnPortalService.activePage === 'ancillary-data')
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
            partnerGroups: this._npnPortalService.getSelectedPartnerGroups().map((group) => group.Network_ID),
            datasets: this._npnPortalService.getSelectedDatasets().map((dataset) => dataset.dataset_id),
            optionalFields: this._outputFieldsService.getSelectedOptionalFields().map((field) => field.metadata_field_id),
            datasheets: this._npnPortalService.getSelectedDatasheets().map((datasheet) => datasheet.id),
            dataPrecision: this._npnPortalService.dataPrecision,
            periodInterest: this._npnPortalService.periodInterest,
            rangeType: this._npnPortalService.rangeType,
            startDay: this._npnPortalService.startDay,
            endDay: this._npnPortalService.endDay,
            startMonth: this._npnPortalService.startMonth,
            endMonth: this._npnPortalService.endMonth,
            startYear: this._npnPortalService.startYear,
            endYear: this._npnPortalService.endYear
        };
        this._persistentSearchService.saveSearch(savedSearch).subscribe((res) => {
            if (res['download_path'] === "error") {
                console.log('Error saving search');
            } else {
                this.savedSearchUrl = this._configService.getPopUrl() + '?search=' + res['saved_search_hash'];
                this.showSavedSearch = true;
            }
        });
    }
}
