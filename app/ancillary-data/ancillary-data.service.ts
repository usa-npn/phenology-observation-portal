import {Injectable, EventEmitter} from '@angular/core';
import {AncillaryData} from './ancillaryData';

@Injectable()
export class AncillaryDataService {

    constructor () {}
    
    public datasheets:AncillaryData[] = [
        {id: 1, name: 'Sites', description: '', selected: false},
        {id: 2, name: 'Individual Plants', description: '', selected: false},
        {id: 3, name: 'Observers', description: '', selected: false},
        {id: 4, name: 'Observation Details', description: '', selected: false},
        {id: 5, name: 'Protocols', description: '', selected: false}
    ];
    
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
