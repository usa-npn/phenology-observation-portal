import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {OutputField} from "./output-field";
import {OutputFieldsService} from "./output-fields.service";
import { OptionalFieldGroup, OPTIONAL_FIELD_GROUPS, usesGroupedFields } from './optional-field-groups';


@Component({
    templateUrl: 'output-fields.html',
    styleUrls: ['output-fields.component.css']
})
export class OutputFieldsComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService,
                private _outputFieldsService: OutputFieldsService,
                private _router: Router) {

        if (this.usesGroupedFields()) {
            this.tabs.push({title: 'Optional Fields', view: 'optionalFieldsView'});
            if (this.getClimateGroups().length) {
                this.tabs.push({title: 'Climate Data', view: 'climateDataView'});
            }
            this.tabs.push({title: 'Default Fields', view: 'defaultFieldsView'});
        } else {
            this.tabs.push({title: 'Optional Fields',     view: 'optionalFieldsView'});
            if (this.getDownloadType() != 'magnitude'){
                this.tabs.push({title: 'Climate Data Fields', view: 'climateFieldsView'});
                //this.tabs.push({title: 'Remote Sensing Data Fields', view: 'remoteSensingFieldsView'});
            }
            this.tabs.push({title: 'Default Data Fields', view: 'defaultFieldsView'});
        }
    }

    optionalFields:OutputField[];
    climateFields:OutputField[];
    remoteSensingFields:OutputField[];
    defaultFields:OutputField[];

    selectAllOptional:boolean;
    selectAllClimate:boolean;
    selectAllRemoteSensing:boolean;

    tabs = [];

    currentTab = 'optionalFieldsView';

    onClickTab(tab) {
        this.currentTab = tab.view;
    }

    isActiveTab(tabUrl) {
        return tabUrl == this.currentTab;
    }

    toggleOptionalField(optionalField) {
        if(!optionalField.selected && this.selectAllOptional)
            this.selectAllOptional = false;
    }

    toggleClimateField(climateField) {
        if(!climateField.selected && this.selectAllClimate)
            this.selectAllClimate = false;
    }

    toggleRemoteSensingField(remoteSensingField) {
        if(!remoteSensingField.selected && this.selectAllRemoteSensing)
            this.selectAllRemoteSensing = false;
    }

    selectAll() {
        if(this.currentTab === 'optionalFieldsView') {
            for(var optionalField of this.optionalFields) {
                optionalField.selected = this.selectAllOptional;
            }
        }
        else if(this.currentTab === 'climateFieldsView') {
            for(var climateField of this.climateFields) {
                climateField.selected = this.selectAllClimate;
            }
        }
        else if(this.currentTab === 'remoteSensingFieldsView') {
            for(var remoteSensingField of this.remoteSensingFields) {
                remoteSensingField.selected = this.selectAllRemoteSensing;
            }
        }
    }

    removeOptionalField(optionalField:OutputField) {
        for(var field of this.optionalFields) {
            if(optionalField.machine_name === field.machine_name) {
                field.selected = false;
                this.selectAllOptional = false;
            }
        }
        for(var field of this.climateFields) {
            if(optionalField.machine_name === field.machine_name) {
                field.selected = false;
                this.selectAllClimate = false;
            }
        }
        for(var field of this.remoteSensingFields) {
            if(optionalField.machine_name === field.machine_name) {
                field.selected = false;
                this.selectAllRemoteSensing = false;
            }
        }
    }

    getQcFields() {
        return this.optionalFields.filter((field) => field.quality_check );
    }

    getNonQcFields() {
        return this.optionalFields.filter((field) => !field.quality_check );
    }

    getDownloadType(){
        return this._npnPortalService.downloadType;
    }

    submit() {
        this._outputFieldsService.optionalFields = this.optionalFields.concat(this.climateFields).concat(this.remoteSensingFields).map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    // --- Grouped-fields methods (raw + summarized) ---

    usesGroupedFields(): boolean {
        return usesGroupedFields(this.getDownloadType());
    }

    getOptionalGroups(): OptionalFieldGroup[] {
        return (OPTIONAL_FIELD_GROUPS[this.getDownloadType()] || []).filter(group => !group.fieldCategory);
    }

    getClimateGroups(): OptionalFieldGroup[] {
        return (OPTIONAL_FIELD_GROUPS[this.getDownloadType()] || []).filter(group => !!group.fieldCategory);
    }

    isGroupSelected(group: OptionalFieldGroup): boolean {
        return this._outputFieldsService.isGroupSelected(group, this.getDownloadType());
    }

    onToggleGroup(group: OptionalFieldGroup, checked: boolean): void {
        this._outputFieldsService.toggleGroup(group, checked, this.getDownloadType());
        this.submit();
    }

    getGroupDisplayItems(group: OptionalFieldGroup): Array<{label: string; tooltip: string}> {
        return this._outputFieldsService.getGroupDisplayItems(group, this.getDownloadType());
    }

    // --- End grouped-fields methods ---

    onSelect(page) {
        this._router.navigate( [page] );
    }

    ngOnInit() {
        this.selectAllOptional = this._outputFieldsService.selectAllOptional;
        this.selectAllClimate = this._outputFieldsService.selectAllClimate;
        this.selectAllRemoteSensing = this._outputFieldsService.selectAllRemoteSensing;

        this.optionalFields = this._npnPortalService.downloadType === "raw" ?
            this._outputFieldsService.optionalFieldsRaw :
            (this._npnPortalService.downloadType === "summarized") ?
                this._outputFieldsService.optionalFieldsSummarized :
                (this._npnPortalService.downloadType === "magnitude") ?
                    this._outputFieldsService.optionalFieldsMagnitude :
                    this._outputFieldsService.optionalFieldsSiteLevelSummarized;

        this.climateFields = this._npnPortalService.downloadType === "raw" ?
            this._outputFieldsService.climateFieldsRaw :
            (this._npnPortalService.downloadType === "summarized" ?
                this._outputFieldsService.climateFieldsSummarized :
                (this._npnPortalService.downloadType === "magnitude" ?
                    this._outputFieldsService.climateFieldsMagnitude :
                    this._outputFieldsService.climateFieldsSiteLevelSummarized));

        this.remoteSensingFields = this._npnPortalService.downloadType === "raw" ?
            this._outputFieldsService.remoteSensingFieldsRaw :
            (this._npnPortalService.downloadType === "summarized" ?
                this._outputFieldsService.remoteSensingFieldsSummarized :
                (this._npnPortalService.downloadType === "magnitude" ?
                    this._outputFieldsService.remoteSensingFieldsMagnitude :
                    this._outputFieldsService.remoteSensingFieldsSiteLevelSummarized));

        this.defaultFields = this._npnPortalService.downloadType === "raw" ?
            this._outputFieldsService.defaultFieldsRaw :
            (this._npnPortalService.downloadType === "summarized" ?
                this._outputFieldsService.defaultFieldsSummarized :
                (this._npnPortalService.downloadType === "magnitude") ?
                    this._outputFieldsService.defaultFieldsMagnitude :
                    this._outputFieldsService.defaultFieldsSiteLevelSummarized);

        this._outputFieldsService.optionalFieldRemoved$.subscribe(optionalField => {this.removeOptionalField(optionalField); this.submit()});
        this._outputFieldsService.submitOptionalFields$.subscribe(() => this.submit());
    }
}
