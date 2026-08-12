import {Injectable, EventEmitter} from '@angular/core';
import {AncillaryData} from './ancillaryData';
import {NpnPortalService} from "../npn-portal.service";
import {PersistentSearchService} from "../persistent-search.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";

@Injectable()
export class AncillaryDataService {

    constructor (private _npnPortalService: NpnPortalService,
                 private _persistentSearchService: PersistentSearchService,
                 private _outputFieldsService: OutputFieldsService) {}

    public ready:boolean = false;
    
    public datasheets:AncillaryData[] = [
        {id: 1, name: 'Sites', description: '', selected: false},
        {id: 2, name: 'Individual Plants', description: '', selected: false},
        {id: 3, name: 'Observers', description: '', selected: false},
        {id: 4, name: 'Site Visit Details', description: '', selected: false},
        {id: 5, name: 'Protocols (7 files)', description: '', selected: false}
    ];
    
    public initDatasheets() {
        let datasheetIds = this._persistentSearchService.datasheets;
        if(datasheetIds) {
            for(var datasheetId of datasheetIds) {
                for(var datasheet of this.datasheets) {
                    if(datasheet.id === datasheetId)
                        datasheet.selected = true;
                }
            }
            this._npnPortalService.datasheets = this.datasheets.map(obj => Object.assign({}, obj));
        }
        // These drive include_submission and the observation_group_id / observedby_person_id
        // forcing in getSelectedIncludeFlags(). AncillaryDataComponent.submit() is the only other
        // place they're set, so without this a restored datasheet has no effect on the download
        // until the user happens to open that page. Same downloadType guard as submit().
        this._outputFieldsService.site_visit_datasheet_selected =
            this.datasheets.some((datasheet) => datasheet.selected && datasheet.name === 'Site Visit Details');
        this._outputFieldsService.observers_datasheet_selected =
            this.datasheets.some((datasheet) => datasheet.selected && datasheet.name === 'Observers')
            && this._npnPortalService.downloadType !== 'summarized';
        this.ready = true;
    }
    
    public ancillaryDataRemoved$ = new EventEmitter();
    public submitAncillaryData$ = new EventEmitter();

    public removeAncillaryData(datasheet:AncillaryData): void {
        this.ancillaryDataRemoved$.emit(datasheet);
    }

    public submitAncillaryData(): void {
        this.submitAncillaryData$.emit({});
    }
    
    public reset() {
        for(var datasheet of this.datasheets) {
            datasheet.selected = false;
        }
    }
}
