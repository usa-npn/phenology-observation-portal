import {Injectable, EventEmitter} from '@angular/core';
import {OutputField} from './output-field';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class OutputFieldsService {

    constructor (private http: Http) {}

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

    //server_url = location.protocol + '//' + location.hostname;

    public getNpnPortalUrl() {
        if(location.hostname.includes('local'))
            return location.protocol + '//' + location.hostname;
        if(location.hostname.includes('dev'))
            return location.protocol + "//www-dev.usanpn.org";
        else
            return location.protocol + "//www.usanpn.org";
    }
    
    private _metadataFieldsUrl = this.getNpnPortalUrl() + '/npn_portal/metadata/getMetadataFields.json';
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
                this.optionalFieldsRaw = rawFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsRaw = rawFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsRaw = rawFields.filter((field) => {return field.required});
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
                this.optionalFieldsSummarized = summarizedFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsSummarized = summarizedFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsSummarized = summarizedFields.filter((field) => {return field.required});
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
                this.optionalFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return !field.climate && !field.required});
                this.climateFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.required});
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
