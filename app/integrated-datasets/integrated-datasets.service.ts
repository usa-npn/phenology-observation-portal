import {Injectable, EventEmitter} from '@angular/core';
import {Dataset} from './dataset';

@Injectable()
export class IntegratedDatasetService {

    constructor () {}

    public datasets:Dataset[] = [{
        id: 12,
        name: 'NYBG',
        description: "New York Botanical Garden forest phenology using old Nature's Notebook protocols, 2009-2013",
        selected: false
    },
    {
        id: 7,
        name: 'Legacy Lilac/Honeysuckle Data',
        description: 'Legacy lilac phenology data for Eastern US (SCSV) and Western US',
        selected: false
    },
    {
        id: 11,
        name: 'ADF Nature Log',
        description: "Mail-in data program using modified Nature's Notebook protocols, 2010-2012",
        selected: false
    }];
    
    public datasetRemoved$ = new EventEmitter();
    public submitDatasets$ = new EventEmitter();

    public removeDataset(dataset:Dataset): void {
        this.datasetRemoved$.emit(dataset);
    }

    public submitDatasets(): void {
        this.submitDatasets$.emit({});
    }
    
    reset() {
        for(var dataset of this.datasets) {
            dataset.selected = false;
        }
    }
}