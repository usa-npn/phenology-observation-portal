import {Component, ViewChild, OnInit}   from '@angular/core';
import {Router} from '@angular/router';
import {NpnPortalService} from '../npn-portal.service';
import {AncillaryData} from './ancillaryData';
import {AncillaryDataService} from "./ancillary-data.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";
import {OutputField} from "../output-fields/output-field";
import {AvailabilityPipe} from "./availability-pipe";
import { BsModalComponent } from 'ng2-bs3-modal';

@Component({
    templateUrl: 'ancillary-data.html',
    styleUrls: ['ancillary-data.component.css']
})
export class AncillaryDataComponent implements OnInit {
    constructor(private _router: Router,
                public _npnPortalService: NpnPortalService,
                private _ancillaryDataService: AncillaryDataService,
                public _outputFieldsService: OutputFieldsService) {}

    @ViewChild('citationModal', {static: false}) 
    citationModal: BsModalComponent;

    @ViewChild('noFiltersWarningModal', {static: false})
    noFiltersWarningModal: BsModalComponent;

    @ViewChild('downloadModal', {static: false})
    downloadModal: BsModalComponent;
    
    @ViewChild('summaryModal', {static: false}) 
    summaryModal: BsModalComponent;

    hasAgreed:boolean = false;
    public showHasNotAgreedWarning:boolean = false;
    
    datasheets:AncillaryData[];
    optionalFields:OutputField[];
    climateFields:OutputField[];

    // toggleDatasheet(datasheet:AncillaryData) {
    //     datasheet.selected = !datasheet.selected;
    //     // these ancillary reports require specific optional fields to be selected
    //     if(datasheet.selected && datasheet.name === "Observers") {
    //         for(var field of this.optionalFields) {
    //             if ("observedby_person_id" === field.machine_name) {
    //                 field.selected = true;
    //             }
    //         }
    //     }
    //     if(datasheet.selected && datasheet.name === "Site Visit Details") {
    //         for(var field of this.optionalFields) {
    //             if ("observation_group_id" === field.machine_name) {
    //                 field.selected = true;
    //             }
    //         }
    //     }
    // }

    removeAncillaryData(datasheet:AncillaryData) {
        for(var d of this.datasheets) {
            if(datasheet.id === d.id)
                d.selected = false;
        }
    }
    
    submit() {
        this._npnPortalService.datasheets = this.datasheets.map(obj => Object.assign({}, obj));
        this._outputFieldsService.optionalFields = this.optionalFields.concat(this.climateFields).map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    download() {
        if(!this.hasAgreed) {
            this.showHasNotAgreedWarning = true;
            // this.citationModal.open();
            // this.citationModal.backdrop = false;
        }
        else if(this._npnPortalService.getDateFilter() == ''
            && !this._npnPortalService.dataPrecision
            && this._npnPortalService.getSelectedStates().length == 0
            && !this._npnPortalService.getSelectedExtent().bottom_left_x1
            && this._npnPortalService.getSelectedSpecies().length == 0
            && this._npnPortalService.getSelectedPhenophases().length == 0
            && this._npnPortalService.getSelectedPartnerGroups().length == 0
            && this._npnPortalService.getSelectedDatasets().length == 0
            && this._outputFieldsService.getSelectedOptionalFields().length == 0
        // && this._npnPortalService.getSelectedDatasheets().length == 0
        ) {
            this.summaryModal.close().then(()=>{
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
        this.summaryModal.close().then(()=>{
            this.downloadModal.open('lg');
            this._npnPortalService.download();
        });
    }

    ngOnInit() {
        this.datasheets =  this._ancillaryDataService.datasheets;
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
        this._ancillaryDataService.ancillaryDataRemoved$.subscribe(dataset => {this.removeAncillaryData(dataset); this.submit()});
        this._ancillaryDataService.submitAncillaryData$.subscribe(() => this.submit());
    }
}