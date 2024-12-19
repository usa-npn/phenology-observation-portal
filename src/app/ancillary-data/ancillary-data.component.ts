import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NpnPortalService } from '../npn-portal.service';
import { AncillaryData } from './ancillaryData';
import { AncillaryDataService } from "./ancillary-data.service";
import { OutputFieldsService } from "../output-fields/output-fields.service";
import { OutputField } from "../output-fields/output-field";
import { BsModalComponent } from 'ng2-bs3-modal';
import { NpnUsageService } from '../services/npn-usage.service';  // Import the NpnUsageService

@Component({
    templateUrl: 'ancillary-data.html',
    styleUrls: ['ancillary-data.component.css']
})
export class AncillaryDataComponent implements OnInit {
    constructor(private _router: Router,
                public _npnPortalService: NpnPortalService,
                private _ancillaryDataService: AncillaryDataService,
                public _outputFieldsService: OutputFieldsService,
                private npnUsageService: NpnUsageService  // Inject NpnUsageService
    ) {}

    @ViewChild('citationModal') 
    citationModal: BsModalComponent;

    @ViewChild('noFiltersWarningModal')
    noFiltersWarningModal: BsModalComponent;

    @ViewChild('downloadModal')
    downloadModal: BsModalComponent;

    @ViewChild('summaryModal') 
    summaryModal: BsModalComponent;

    hasAgreed: boolean = false;
    public showHasNotAgreedWarning: boolean = false;

    datasheets: AncillaryData[];
    optionalFields: OutputField[];
    climateFields: OutputField[];

    removeAncillaryData(datasheet: AncillaryData) {
        for (var d of this.datasheets) {
            if (datasheet.id === d.id)
                d.selected = false;
        }
    }

    submit() {
        this._npnPortalService.datasheets = this.datasheets.map(obj => Object.assign({}, obj));
        this._outputFieldsService.site_visit_datasheet_selected = false;
        this._outputFieldsService.observers_datasheet_selected = false;
        for (var datasheet of this.datasheets) {
            if (datasheet.selected && datasheet.name === "Site Visit Details") {
                for (var field of this.optionalFields) {
                    if ("observation_group_id" === field.machine_name) {
                        field.selected = true;
                        this._outputFieldsService.site_visit_datasheet_selected = true;
                    }
                }
            }
            if (datasheet.selected && datasheet.name === "Observers") {
                for (var field of this.optionalFields) {
                    if ("observedby_person_id" === field.machine_name) {
                        field.selected = true;
                        this._outputFieldsService.observers_datasheet_selected = true;
                    }
                }
            }
        }
        this._outputFieldsService.optionalFields = this.optionalFields.concat(this.climateFields).map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate([page]);
    }

    // Updated method to dynamically determine the metric_id based on getDownloadType
    insertNpnUsageRow() {
        let metricId;
        const downloadType = this._npnPortalService.downloadType; // Get the download type
        switch (downloadType) {
            case 'raw':
                metricId = 2; // Status and Intensity
                break;
            case 'summarized':
                metricId = 3; // Individual Phenometrics
                break;
            case 'siteLevelSummarized':
                metricId = 4; // Site Phenometrics
                break;
            case 'magnitude':
                metricId = 5; // Magnitude Phenometrics
                break;
            default:
                console.log('Invalid download type, skipping metric_id update.');
                return; // Exit gracefully if no valid download type is found
        }

        const newUsage = {
            date_time: new Date().toISOString(),  // Current datetime in ISO format
            tool_id: 1,                           // Tool ID for this component (set to 1)
            metric_id: metricId                   // Metric ID determined dynamically
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
        this.insertNpnUsageRow();  // Insert the row when download starts
        console.log('Download started');
        if (!this.hasAgreed) {
            this.showHasNotAgreedWarning = true;
        }
        else if (this._npnPortalService.getDateFilter() == ''
            && !this._npnPortalService.dataPrecision
            && this._npnPortalService.getSelectedStates().length == 0
            && !this._npnPortalService.getSelectedExtent().bottom_left_x1
            && this._npnPortalService.getSelectedSpecies().length == 0
            && this._npnPortalService.getSelectedPhenophases().length == 0
            && this._npnPortalService.getSelectedPartnerGroups().length == 0
            && this._npnPortalService.getSelectedDatasets().length == 0
            && this._outputFieldsService.getSelectedOptionalFields().length == 0) {
            this.summaryModal.close().then(() => {
                this.noFiltersWarningModal.open();
            });
        }
        else {
            this.continueDownload();
        }
    }

    continueDownloadWithNoFilters() {
        this.downloadModal.open('lg');
        this._npnPortalService.download();
    }

    continueDownload() {
        this.summaryModal.close().then(() => {
            this.downloadModal.open('lg');
            this._npnPortalService.download();   
        });
    }

    ngOnInit() {
        this.datasheets = this._ancillaryDataService.datasheets;
        this.optionalFields =
            (this._npnPortalService.downloadType === "raw" ?
                this._outputFieldsService.optionalFieldsRaw :
                (this._npnPortalService.downloadType === "summarized" ?
                    this._outputFieldsService.optionalFieldsSummarized :
                    (this._npnPortalService.downloadType === "magnitude" ?
                        this._outputFieldsService.optionalFieldsMagnitude :
                        this._outputFieldsService.optionalFieldsSiteLevelSummarized
                    )
                )
            );
        this.climateFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.climateFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.climateFieldsSummarized : this._outputFieldsService.climateFieldsSiteLevelSummarized);
        this._ancillaryDataService.ancillaryDataRemoved$.subscribe(dataset => { this.removeAncillaryData(dataset); this.submit(); });
        this._ancillaryDataService.submitAncillaryData$.subscribe(() => this.submit());
    }
}
