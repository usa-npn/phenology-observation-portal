import {Component, ViewChild, OnInit}   from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {NpnPortalService} from '../npn-portal.service';
import {AncillaryData} from './ancillaryData';
import {AncillaryDataService} from "./ancillary-data.service";
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {OutputFieldsService} from "../output-fields/output-fields.service";
import {OutputField} from "../output-fields/output-field";
import {AvailabilityPipe} from "./availability-pipe";

@Component({
    pipes: [AvailabilityPipe],
    templateUrl: 'app/ancillary-data/ancillary-data.html',
    styleUrls: ['app/ancillary-data/ancillary-data.component.css'],
    directives: [ROUTER_DIRECTIVES, MODAL_DIRECTIVES]
})
export class AncillaryDataComponent implements OnInit {
    constructor(private _router: Router,
                public _npnPortalService: NpnPortalService,
                private _ancillaryDataService: AncillaryDataService,
                private _outputFieldsService: OutputFieldsService) {}

    @ViewChild('citationModal') 
    citationModal: ModalComponent;

    @ViewChild('noFiltersWarningModal')
    noFiltersWarningModal: ModalComponent;

    @ViewChild('downloadModal')
    downloadModal: ModalComponent;
    
    @ViewChild('summaryModal') 
    summaryModal: ModalComponent;

    hasAgreed:boolean = false;
    
    datasheets:AncillaryData[];
    optionalFields:OutputField[];
    climateFields:OutputField[];

    toggleDatasheet(datasheet:AncillaryData) {
        datasheet.selected = !datasheet.selected;
        // these ancillary reports require specific optional fields to be selected
        if(datasheet.selected && datasheet.name === "Observers") {
            for(var field of this.optionalFields) {
                if ("observedby_person_id" === field.machine_name) {
                    field.selected = true;
                }
            }
        }
        if(datasheet.selected && datasheet.name === "Site Visit Details") {
            for(var field of this.optionalFields) {
                if ("observation_group_id" === field.machine_name) {
                    field.selected = true;
                }
            }
        }
    }

    removeAncillaryData(datasheet:AncillaryData) {
        for(var d of this.datasheets) {
            if(datasheet.id === d.id)
                d.selected = false;
        }
    }
    
    submit() {
        this._npnPortalService.datasheets = this.datasheets.map(obj => Object.assign({}, obj));
        this._npnPortalService.optionalFields = this.optionalFields.concat(this.climateFields).map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
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
            this.noFiltersWarningModal.open();
        }
        else {
            this.continueDownload();
        }
    }

    continueDownload() {
        this.summaryModal.close();
        this.downloadModal.open('lg');
        this._npnPortalService.download();
    }
    
    


    //routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    // canDeactivate(, route: ActivatedRouteSnapshot, state: RouterStateSnapshot):boolean {
    //     this.submit();
    //     //this._npnPortalService.activePage = next.routeName;
    //     this._npnPortalService.activePage = state.url;
    //     return true;
    // }

    ngOnInit() {
        this.datasheets =  this._ancillaryDataService.datasheets;
        this.optionalFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.optionalFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.optionalFieldsSummarized : this._outputFieldsService.optionalFieldsSiteLevelSummarized);
        this.climateFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.climateFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.climateFieldsSummarized : this._outputFieldsService.climateFieldsSiteLevelSummarized);
        this._ancillaryDataService.ancillaryDataRemoved$.subscribe(dataset => {this.removeAncillaryData(dataset); this.submit()});
        this._ancillaryDataService.submitAncillaryData$.subscribe(() => this.submit());
    }
}