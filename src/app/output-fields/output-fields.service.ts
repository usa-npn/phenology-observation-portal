import {Injectable, EventEmitter} from '@angular/core';
import {OutputField} from './output-field';
import { HttpClient } from '@angular/common/http';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";

@Injectable()
export class OutputFieldsService {

    constructor (private http: HttpClient, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService
                 ) {}

    private remote_sensing_fields = [
                        'evi_minimum_0',
                        'evi_minimum_1',
                        'evi_amplitude_0',
                        'evi_amplitude_1',
                        'evi_area_0',
                        'evi_area_1',
                        'greenup_0',
                        'greenup_1',
                        'midgreenup_0',
                        'midgreenup_1',
                        'peak_0',
                        'peak_1',
                        'numcycles',
                        'maturity_0',
                        'maturity_1',
                        'midgreendown_0',
                        'midgreendown_1',
                        'senescence_0',
                        'senescence_1',
                        'dormancy_0',
                        'dormancy_1',
                        'qa_detailed_0',
                        'qa_detailed_1',
                        'qa_overall_0',
                        'qa_overall_1'];

    public optionalFieldRemoved$ = new EventEmitter();
    public submitOptionalFields$ = new EventEmitter();

    public removeOptionalField(optionalField:OutputField): void {
        this.optionalFieldRemoved$.emit(optionalField);
    }

    public submitOptionalFields(): void {
        this.submitOptionalFields$.emit({});
    }
    
    public selectAllOptional:boolean = false;
    public selectAllClimate:boolean = false;
	public selectAllRemoteSensing:boolean = false;

    private _metadataFieldsUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/metadata/getMetadataFields.json';
    public rawFieldsReady: boolean = false;
    public summarizedFieldsReady: boolean = false;
    public siteLevelSummarizedFieldsReady: boolean = false;
    public magnitudeFieldsReady: boolean = false;
    errorMessage: string;

    public rawFields:OutputField[] = [];
    public optionalFieldsRaw:OutputField[] = [];
    public climateFieldsRaw:OutputField[] = [];
	public remoteSensingFieldsRaw:OutputField[] = [];
    public defaultFieldsRaw:OutputField[] = [];
    
    public summarizedFields:OutputField[] = [];
    public optionalFieldsSummarized:OutputField[] = [];
    public climateFieldsSummarized:OutputField[] = [];
	public remoteSensingFieldsSummarized:OutputField[] = [];
    public defaultFieldsSummarized:OutputField[] = [];
    
    public siteLevelSummarizedFields:OutputField[] = [];
    public optionalFieldsSiteLevelSummarized:OutputField[]= [];
    public climateFieldsSiteLevelSummarized:OutputField[] = [];
	public remoteSensingFieldsSiteLevelSummarized:OutputField[] = [];
    public defaultFieldsSiteLevelSummarized:OutputField[] = [];
    
    public magnitudeFields:OutputField[] = [];
    public siteLevelMagnitude:OutputField[] = [];
    public optionalFieldsMagnitude:OutputField[]= [];
    public climateFieldsMagnitude:OutputField[] = [];
    public defaultFieldsMagnitude:OutputField[] = [];   
    
    optionalFields:OutputField[] = [];

    public site_visit_datasheet_selected = false;
    public observers_datasheet_selected = false;

    dataQualityChecksSelected() {
        for (var field of this.optionalFields) {
            if (field.selected && field.machine_name === 'observed_status_conflict_flag')
                return true;
        }
        return false
    }

    getSelectedOptionalFields() {
        return this.optionalFields.filter((f) => {
            return f.selected 
                || (f.machine_name == 'observation_group_id' && this.site_visit_datasheet_selected)
                || (f.machine_name == 'observedby_person_id' && this.observers_datasheet_selected)
        })
    }

    togglePartnerGroupOptionalField(selected, downloadType) {
        if(downloadType === 'raw') {
            for (var field of this.optionalFieldsRaw) {
                if (field.machine_name === 'partner_group')
                    field.selected =  selected;
            }
            this.optionalFields = this.optionalFieldsRaw.concat(this.climateFieldsRaw).concat(this.remoteSensingFieldsRaw).map(obj => Object.assign({}, obj));
        }
        if(downloadType === 'summarized') {
            for (var field of this.optionalFieldsSummarized) {
                if (field.machine_name === 'partner_group')
                    field.selected =  selected;
            }
            this.optionalFields = this.optionalFieldsSummarized.concat(this.climateFieldsSummarized).concat(this.remoteSensingFieldsSummarized).map(obj => Object.assign({}, obj));
        }
        if(downloadType === 'siteLevelSummarized') {
            for (var field of this.optionalFieldsSiteLevelSummarized) {
                if (field.machine_name === 'partner_group')
                    field.selected =  selected;
            }
            this.optionalFields = this.optionalFieldsSiteLevelSummarized.concat(this.climateFieldsSiteLevelSummarized).concat(this.remoteSensingFieldsSiteLevelSummarized).map(obj => Object.assign({}, obj));
        }
        if(downloadType === 'magnitude') {
            for (var field of this.optionalFieldsMagnitude) {
                if (field.machine_name === 'partner_group')
                    field.selected =  selected;
            }
            this.optionalFields = this.optionalFieldsMagnitude.concat(this.climateFieldsMagnitude).map(obj => Object.assign({}, obj));
        }
    }

    mapBooleans(field) {
        field.quality_check === 1 ? field.quality_check = true : field.quality_check = false;
        field.climate === 1 ? field.climate = true : field.climate = false;
		field.remote_sensing === 1 ? field.remote_sensing = true : field.remote_sensing = false;
        field.required === 1 ? field.required = true : field.required = false;
        field.field_name = field.field_name.replace(/_/gi, ' ');
    }

    initRawFields() {
        this.getRawFields().subscribe(
            rawFields => {
                // booleans are nicer to work with than numbers
                rawFields.map(this.mapBooleans);
                this.rawFields = rawFields;

                let fieldIds = this._persistentSearchService.optionalFields;
                if(fieldIds) {
                    for(var fieldId of fieldIds) {
                        for(var rawField of this.rawFields) {
                            if(rawField.metadata_field_id === fieldId)
                                rawField.selected = true;
                        }
                    }
                }
                
                this.optionalFieldsRaw = rawFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsRaw = rawFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsRaw = rawFields.filter((field) => {return field.remote_sensing && !field.climate && !field.required});
                this.defaultFieldsRaw = rawFields.filter((field) => {return field.required});

                this.optionalFields = this.optionalFieldsRaw.concat(this.climateFieldsRaw).concat(this.remoteSensingFieldsRaw).map(obj => Object.assign({}, obj));                    
                
                this.rawFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getRawFields() {
        return this.http.get<OutputField[]>(this._metadataFieldsUrl + '?type=raw');
    }

    initSummarizedFields() {
        this.getSummarizedFields().subscribe(
            summarizedFields => {
                // booleans are nicer to work with than numbers
                summarizedFields.map(this.mapBooleans);
                this.summarizedFields = summarizedFields;

                let fieldIds = this._persistentSearchService.optionalFields;
                if(fieldIds) {
                    for(var fieldId of fieldIds) {
                        for(var summarizedField of this.summarizedFields) {
                            if(summarizedField.metadata_field_id === fieldId)
                                summarizedField.selected = true;
                        }
                    }
                }
                
                this.optionalFieldsSummarized = summarizedFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsSummarized = summarizedFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsSummarized = summarizedFields.filter((field) => {return field.remote_sensing &&  !field.climate && !field.required});
                this.defaultFieldsSummarized = summarizedFields.filter((field) => {return field.required});

                this.optionalFields = this.optionalFieldsSummarized.concat(this.climateFieldsSummarized).map(obj => Object.assign({}, obj));
                
                this.summarizedFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getSummarizedFields() {
        return this.http.get<OutputField[]>(this._metadataFieldsUrl + '?type=individual_summarized');
    }

    initSiteLevelSummarizedFields() {
        this.getSiteLevelSummarizedFields().subscribe(
            siteLevelSummarizedFields => {
                // booleans are nicer to work with than numbers
                siteLevelSummarizedFields.map(this.mapBooleans);
                this.siteLevelSummarizedFields = siteLevelSummarizedFields;

                let fieldIds = this._persistentSearchService.optionalFields;
                if(fieldIds) {
                    for(var fieldId of fieldIds) {
                        for(var siteLevelSummarizedField of this.siteLevelSummarizedFields) {
                            if(siteLevelSummarizedField.metadata_field_id === fieldId)
                                siteLevelSummarizedField.selected = true;
                        }
                    }
                }
                
                this.optionalFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.remote_sensing &&  !field.climate && !field.required});
                this.defaultFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.required});

                this.optionalFields = this.optionalFieldsSiteLevelSummarized.concat(this.climateFieldsSiteLevelSummarized).map(obj => Object.assign({}, obj));
                
                this.siteLevelSummarizedFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getSiteLevelSummarizedFields() {
        return this.http.get<OutputField[]>(this._metadataFieldsUrl + '?type=site_summarized');
    }
    
    
    initMagnitudeFields() {
        this.getMagnitudeFields().subscribe(
            magnitudeFields => {
                // booleans are nicer to work with than numbers
                magnitudeFields.map(this.mapBooleans);
                this.magnitudeFields = magnitudeFields;

                let fieldIds = this._persistentSearchService.optionalFields;
                if(fieldIds) {
                    for(var fieldId of fieldIds) {
                        for(var magnitudeField of this.magnitudeFields) {
                            if(magnitudeField.metadata_field_id === fieldId)
                                magnitudeField.selected = true;
                        }
                    }
                }
                
                
                this.optionalFieldsMagnitude = magnitudeFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing});
                this.climateFieldsMagnitude = magnitudeFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsMagnitude = magnitudeFields.filter((field) => {return field.required});

                this.optionalFields = this.optionalFieldsMagnitude.concat(this.climateFieldsMagnitude).map(obj => Object.assign({}, obj));
                
                this.magnitudeFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }    
    
    
    getMagnitudeFields() {
        return this.http.get<OutputField[]>(this._metadataFieldsUrl + '?type=magnitude');
    }    

    togglePartnerGroupField(selected) {
        for(var field of this.rawFields) {
            if(field.machine_name == '') {
                field.selected = selected;
            }
        }
        for(var field of this.optionalFieldsRaw) {
            if(field.machine_name == '') {
                field.selected = selected;
            }
        }
        for(var field of this.optionalFieldsSummarized) {
            if(field.machine_name == '') {
                field.selected = selected;
            }
        }
        for(var field of this.optionalFieldsSiteLevelSummarized) {
            if(field.machine_name == '') {
                field.selected = selected;
            }
        }
        for(var field of this.optionalFieldsMagnitude) {
            if(field.machine_name == '') {
                field.selected = selected;
            }
        }
    }
    
    reset() {
        this.selectAllOptional = false;
        this.selectAllClimate = false;
		this.selectAllRemoteSensing = false;

        for(var field of this.rawFields) {
            field.selected = false;
        }
        for(var field of this.optionalFieldsRaw) {
            field.selected = false;
        }
        for(var field of this.climateFieldsRaw) {
            field.selected = false;
        }
        for(var field of this.remoteSensingFieldsRaw) {
            field.selected = false;
        }
        for(var field of this.summarizedFields) {
            field.selected = false;
        }
        for(var field of this.optionalFieldsSummarized) {
            field.selected = false;
        }
        for(var field of this.climateFieldsSummarized) {
            field.selected = false;
        }
        for(var field of this.remoteSensingFieldsSummarized) {
            field.selected = false;
        }		
        for(var field of this.siteLevelSummarizedFields) {
            field.selected = false;
        }
        for(var field of this.optionalFieldsSiteLevelSummarized) {
            field.selected = false;
        }
        for(var field of this.climateFieldsSiteLevelSummarized) {
            field.selected = false;
        }
        for(var field of this.remoteSensingFieldsSiteLevelSummarized) {
            field.selected = false;
        }		
    }

}
