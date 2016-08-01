import {Injectable, EventEmitter} from '@angular/core';
import {Dataset} from './dataset';
import {Http, Response} from "@angular/http";
import {Observable} from 'rxjs/Observable';
import {Config} from '../config.service';

@Injectable()
export class IntegratedDatasetService {

    constructor (private http: Http, private config: Config) {}
    
    private _datasetUrl = this.config.getServerUrl() + '/npn_portal/observations/getDatasetDetails.json';
    errorMessage: string;
    public ready:boolean = false;
    public datasets:Dataset[] = [];

    public datasetRemoved$ = new EventEmitter();
    public submitDatasets$ = new EventEmitter();

    public removeDataset(dataset:Dataset): void {
        this.datasetRemoved$.emit(dataset);
    }

    public submitDatasets(): void {
        this.submitDatasets$.emit({});
    }

    initDatasets() {
        this.getDatasets().subscribe(
            datasets => {this.datasets = datasets.filter((d) => d.dataset_id === 7 || d.dataset_id === 8 || d.dataset_id === 11 || d.dataset_id === 13); console.log('datasets have been set'); this.ready = true;},
            error => this.errorMessage = <any>error)
    }

    getDatasets() {
        return this.http.get(this._datasetUrl)
            .map(res => <Dataset[]> res.json())
            // .filter(function (d: any){return d.dataset_id === 7 || d.dataset_id === 8 || d.dataset_id === 11 || d.dataset_id === 12})
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    public reset() {
        for(var dataset of this.datasets) {
            dataset.selected = false;
        }
    }
    
    
    
    
    

    // public datasets:Dataset[] = [{
    //     id: 12,
    //     name: 'NYBG',
    //     description: "New York Botanical Garden forest phenology using old Nature's Notebook protocols, 2009-2013",
    //     selected: false
    // },
    // {
    //     id: 7,
    //     name: 'Legacy Lilac/Honeysuckle Data',
    //     description: 'Legacy lilac phenology data for Eastern US (SCSV) and Western US',
    //     selected: false
    // },
    // {
    //     id: 11,
    //     name: 'ADF Nature Log',
    //     description: "Mail-in data program using modified Nature's Notebook protocols, 2010-2012",
    //     selected: false
    // }];
    
    // public datasetRemoved$ = new EventEmitter();
    // public submitDatasets$ = new EventEmitter();
    //
    // public removeDataset(dataset:Dataset): void {
    //     this.datasetRemoved$.emit(dataset);
    // }
    //
    // public submitDatasets(): void {
    //     this.submitDatasets$.emit({});
    // }
    //
    // reset() {
    //     for(var dataset of this.datasets) {
    //         dataset.selected = false;
    //     }
    // }
}