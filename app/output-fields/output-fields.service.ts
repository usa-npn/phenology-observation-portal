import {Injectable, EventEmitter} from '@angular/core';
import {OutputField} from './output-field';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class OutputFieldsService {

    constructor (private http: Http, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService, 
                 private _npnPortalService: NpnPortalService) {}

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

    private _metadataFieldsUrl = this.config.getServerUrl() + '/npn_portal/metadata/getMetadataFields.json';
    public rawFieldsReady: boolean = false;
    public summarizedFieldsReady: boolean = false;
    public siteLevelSummarizedFieldsReady: boolean = false;
    errorMessage: string;

    public rawFields:OutputField[] = [];
    public optionalFieldsRaw:OutputField[] = [];
    public climateFieldsRaw:OutputField[] = [];
    public defaultFieldsRaw:OutputField[] = [];
    
    public summarizedFields:OutputField[] = [];
    public optionalFieldsSummarized:OutputField[] = [];
    public climateFieldsSummarized:OutputField[] = [];
    public defaultFieldsSummarized:OutputField[] = [];
    
    public siteLevelSummarizedFields:OutputField[] = [];
    public optionalFieldsSiteLevelSummarized:OutputField[]= [];
    public climateFieldsSiteLevelSummarized:OutputField[] = [];
    public defaultFieldsSiteLevelSummarized:OutputField[] = [];

    mapBooleans(field) {
        field.quality_check === 1 ? field.quality_check = true : field.quality_check = false;
        field.climate === 1 ? field.climate = true : field.climate = false;
        field.required === 1 ? field.required = true : field.required = false;
        field.field_name = field.field_name.replace(/_/gi, ' ');
    }

    initRawFields() {
        this.getRawFields().subscribe(
            rawFields => {
                // booleans are nicer to work with than numbers
                rawFields.map(this.mapBooleans);
                this.rawFields = rawFields;

                if(this._npnPortalService.downloadType === "raw") {
                    let fieldIds = this._persistentSearchService.optionalFields;
                    if(fieldIds) {
                        for(var fieldId of fieldIds) {
                            for(var rawField of this.rawFields) {
                                if(rawField.metadata_field_id === fieldId)
                                    rawField.selected = true;
                            }
                        }
                    }
                }
                
                this.optionalFieldsRaw = rawFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsRaw = rawFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsRaw = rawFields.filter((field) => {return field.required});

                if(this._npnPortalService.downloadType === "raw")
                    this._npnPortalService.optionalFields = this.optionalFieldsRaw.concat(this.climateFieldsRaw).map(obj => Object.assign({}, obj));
                
                this.rawFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getRawFields() {
        return this.http.get(this._metadataFieldsUrl + '?type=raw')
            .map(res => <OutputField[]> res.json())
            .catch(this.handleError);
    }

    initSummarizedFields() {
        this.getSummarizedFields().subscribe(
            summarizedFields => {
                // booleans are nicer to work with than numbers
                summarizedFields.map(this.mapBooleans);
                this.summarizedFields = summarizedFields;

                if(this._npnPortalService.downloadType === "summarized") {
                    let fieldIds = this._persistentSearchService.optionalFields;
                    if(fieldIds) {
                        for(var fieldId of fieldIds) {
                            for(var summarizedField of this.summarizedFields) {
                                if(summarizedField.metadata_field_id === fieldId)
                                    summarizedField.selected = true;
                            }
                        }
                    }
                }
                
                this.optionalFieldsSummarized = summarizedFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsSummarized = summarizedFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsSummarized = summarizedFields.filter((field) => {return field.required});

                if(this._npnPortalService.downloadType === "summarized")
                    this._npnPortalService.optionalFields = this.optionalFieldsSummarized.concat(this.climateFieldsSummarized).map(obj => Object.assign({}, obj));
                
                this.summarizedFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getSummarizedFields() {
        return this.http.get(this._metadataFieldsUrl + '?type=individual_summarized')
            .map(res => <OutputField[]> res.json())
            .catch(this.handleError);
    }

    initSiteLevelSummarizedFields() {
        this.getSiteLevelSummarizedFields().subscribe(
            siteLevelSummarizedFields => {
                // booleans are nicer to work with than numbers
                siteLevelSummarizedFields.map(this.mapBooleans);
                this.siteLevelSummarizedFields = siteLevelSummarizedFields;

                if(this._npnPortalService.downloadType === "siteLevelSummarized") {
                    let fieldIds = this._persistentSearchService.optionalFields;
                    if(fieldIds) {
                        for(var fieldId of fieldIds) {
                            for(var siteLevelSummarizedField of this.siteLevelSummarizedFields) {
                                if(siteLevelSummarizedField.metadata_field_id === fieldId)
                                    siteLevelSummarizedField.selected = true;
                            }
                        }
                    }
                }
                
                this.optionalFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.required});

                if(this._npnPortalService.downloadType === "siteLevelSummarized")
                    this._npnPortalService.optionalFields = this.optionalFieldsSiteLevelSummarized.concat(this.climateFieldsSiteLevelSummarized).map(obj => Object.assign({}, obj));
                
                this.siteLevelSummarizedFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }

    getSiteLevelSummarizedFields() {
        return this.http.get(this._metadataFieldsUrl + '?type=site_summarized')
            .map(res => <OutputField[]> res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    
    reset() {
        this.selectAllOptional = false;
        this.selectAllClimate = false;

        for(var field of this.rawFields) {
            field.selected = false;
        }
        for(var field of this.optionalFieldsRaw) {
            field.selected = false;
        }
        for(var field of this.climateFieldsRaw) {
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
        for(var field of this.siteLevelSummarizedFields) {
            field.selected = false;
        }
        for(var field of this.optionalFieldsSiteLevelSummarized) {
            field.selected = false;
        }
        for(var field of this.climateFieldsSiteLevelSummarized) {
            field.selected = false;
        }
    }

}
