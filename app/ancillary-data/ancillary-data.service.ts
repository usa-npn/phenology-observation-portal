import {Injectable, EventEmitter} from '@angular/core';
import {AncillaryData} from './ancillaryData';
import {NpnPortalService} from "../npn-portal.service";
import {PersistentSearchService} from "../persistent-search.service";

@Injectable()
export class AncillaryDataService {

    constructor (private _npnPortalService: NpnPortalService, 
                 private _persistentSearchService: PersistentSearchService) {}

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
