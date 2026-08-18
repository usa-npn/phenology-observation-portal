import {Injectable, EventEmitter} from '@angular/core';
import {OutputField} from './output-field';
import { HttpClient } from '@angular/common/http';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import { OptionalFieldGroup, OPTIONAL_FIELD_GROUPS, getPartnerGroupFieldGroup } from './optional-field-groups';

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
	public remoteSensingFieldsMagnitude:OutputField[] = [];
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

    // Filtering by partner group implies the partner_group column is wanted, so selecting any
    // partner group checks the whole group that owns it - under grouped fields a single member
    // being selected shows nothing in the UI and sends no include_* flag. Deliberately one-way:
    // clearing the partner group filter leaves the group checked rather than silently dropping a
    // group's worth of columns the user may have checked themselves.
    selectPartnerGroupFieldGroup(downloadType) {
        const group = getPartnerGroupFieldGroup(downloadType);
        if (!group) return; // magnitude has no partner_group column
        this.toggleGroup(group, true, downloadType);
        this.syncOptionalFields(downloadType);
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

                this.optionalFieldsRaw = rawFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsRaw = rawFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsRaw = rawFields.filter((field) => {return field.remote_sensing && !field.climate && !field.required});
                this.defaultFieldsRaw = rawFields.filter((field) => {return field.required});

                this.applySavedGroups('raw');

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

                this.optionalFieldsSummarized = summarizedFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsSummarized = summarizedFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsSummarized = summarizedFields.filter((field) => {return field.remote_sensing &&  !field.climate && !field.required});
                this.defaultFieldsSummarized = summarizedFields.filter((field) => {return field.required});

                this.applySavedGroups('summarized');

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

                this.optionalFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing && this.remote_sensing_fields.indexOf(field.machine_name) == -1});
                this.climateFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.climate && !field.required});
				this.remoteSensingFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.remote_sensing &&  !field.climate && !field.required});
                this.defaultFieldsSiteLevelSummarized = siteLevelSummarizedFields.filter((field) => {return field.required});

                this.applySavedGroups('siteLevelSummarized');

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

                this.optionalFieldsMagnitude = magnitudeFields.filter((field) => {return !field.climate && !field.required && !field.remote_sensing});
                this.climateFieldsMagnitude = magnitudeFields.filter((field) => {return field.climate && !field.required});
                this.defaultFieldsMagnitude = magnitudeFields.filter((field) => {return field.required});

                this.applySavedGroups('magnitude');

                this.optionalFields = this.optionalFieldsMagnitude.concat(this.climateFieldsMagnitude).map(obj => Object.assign({}, obj));
                
                this.magnitudeFieldsReady = true;
            },
            error => this.errorMessage = <any>error)
    }    
    
    
    getMagnitudeFields() {
        return this.http.get<OutputField[]>(this._metadataFieldsUrl + '?type=magnitude');
    }    

    // --- Group helpers (raw, summarized, siteLevelSummarized, magnitude) ---

    // Re-select the groups a saved search stored. Called from each init*Fields() once the
    // per-category arrays exist, since getGroupMembers() reads them. Selecting whole groups is
    // what guarantees isGroupSelected() - and therefore the include_* flag - comes back true.
    // Pre-cutover searches carry per-field metadata_field_ids instead and are not restored.
    private applySavedGroups(downloadType: string): void {
        const flags = this._persistentSearchService.optionalFieldGroups;
        if (flags && flags.length) {
            for (const group of OPTIONAL_FIELD_GROUPS[downloadType] || []) {
                if (flags.indexOf(group.flag) !== -1)
                    this.toggleGroup(group, true, downloadType);
            }
        }

        // Same rule as selectPartnerGroupFieldGroup(), applied on restore: a search saved with a
        // partner group filter comes back with the owning group checked, whether or not its flag
        // was stored. This is the one point where both the restored partner groups and the
        // per-category field arrays exist, so it can't be done from PartnerGroupsService.
        const savedPartnerGroups = this._persistentSearchService.partnerGroups;
        if (savedPartnerGroups && savedPartnerGroups.length)
            this.selectPartnerGroupFieldGroup(downloadType);
    }

    // Whether the metadata for a download type has loaded. Defaults to true so a cold start,
    // where no type is chosen yet, has nothing to wait on.
    fieldsReady(downloadType: string): boolean {
        switch (downloadType) {
            case 'raw':                 return this.rawFieldsReady;
            case 'summarized':          return this.summarizedFieldsReady;
            case 'siteLevelSummarized': return this.siteLevelSummarizedFieldsReady;
            case 'magnitude':           return this.magnitudeFieldsReady;
            default:                    return true;
        }
    }

    private getFieldArrays(downloadType: string) {
        switch (downloadType) {
            case 'summarized':
                return { optional: this.optionalFieldsSummarized,
                         climate: this.climateFieldsSummarized,
                         remoteSensing: this.remoteSensingFieldsSummarized };
            case 'siteLevelSummarized':
                return { optional: this.optionalFieldsSiteLevelSummarized,
                         climate: this.climateFieldsSiteLevelSummarized,
                         remoteSensing: this.remoteSensingFieldsSiteLevelSummarized };
            case 'magnitude':
                return { optional: this.optionalFieldsMagnitude,
                         climate: this.climateFieldsMagnitude,
                         remoteSensing: this.remoteSensingFieldsMagnitude };
            default:
                return { optional: this.optionalFieldsRaw,
                         climate: this.climateFieldsRaw,
                         remoteSensing: this.remoteSensingFieldsRaw };
        }
    }

    getGroupMembers(group: OptionalFieldGroup, downloadType: string): OutputField[] {
        const { optional, climate, remoteSensing } = this.getFieldArrays(downloadType);
        if (group.fieldCategory === 'climate') return climate;
        if (group.fieldCategory === 'remoteSensing') return remoteSensing;
        return group.machineNames
            .map(name => optional.find(f => f.machine_name === name))
            .filter((f): f is OutputField => f !== undefined);
    }

    getGroupDisplayItems(group: OptionalFieldGroup, downloadType: string): Array<{label: string; tooltip: string}> {
        const { optional, climate, remoteSensing } = this.getFieldArrays(downloadType);
        if (group.fieldCategory === 'climate') {
            return climate.map(f => ({ label: f.field_name, tooltip: f.field_description }));
        }
        if (group.fieldCategory === 'remoteSensing') {
            return remoteSensing.map(f => ({ label: f.field_name, tooltip: f.field_description }));
        }
        return group.machineNames.map(name => {
            const field = optional.find(f => f.machine_name === name);
            if (field) return { label: field.field_name, tooltip: field.field_description };
            const fallback = group.fallbacks && group.fallbacks[name];
            if (fallback) return { label: fallback.label, tooltip: fallback.tooltip };
            return { label: name.replace(/_/g, ' '), tooltip: '' };
        });
    }

    isGroupSelected(group: OptionalFieldGroup, downloadType: string): boolean {
        const members = this.getGroupMembers(group, downloadType);
        return members.length > 0 && members.every(f => f.selected);
    }

    toggleGroup(group: OptionalFieldGroup, selected: boolean, downloadType: string): void {
        const members = this.getGroupMembers(group, downloadType);
        for (const field of members) {
            field.selected = selected;
        }
    }

    getSelectedGroups(downloadType: string): OptionalFieldGroup[] {
        return (OPTIONAL_FIELD_GROUPS[downloadType] || []).filter(group => this.isGroupSelected(group, downloadType));
    }

    getSelectedIncludeFlags(downloadType: string): { [key: string]: string } {
        const flags: { [key: string]: string } = {};
        for (const group of OPTIONAL_FIELD_GROUPS[downloadType] || []) {
            if (this.isGroupSelected(group, downloadType)) {
                flags[group.flag] = '1';
            }
        }
        // The Observers datasheet is only offered for Status and Intensity, and only raw declares
        // include_submission, so the forcing must not fire for any other type.
        if (this.observers_datasheet_selected && downloadType === 'raw') {
            flags['include_submission'] = '1';
        }
        return flags;
    }

    syncOptionalFields(downloadType: string): void {
        const { optional, climate, remoteSensing } = this.getFieldArrays(downloadType);
        this.optionalFields = optional.concat(climate).concat(remoteSensing).map(obj => Object.assign({}, obj));
    }

    // --- End group helpers ---

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
        this.site_visit_datasheet_selected = false;
        this.observers_datasheet_selected = false;

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
