import {Injectable, EventEmitter} from '@angular/core';
import {Dataset} from './dataset';
import {Http, Response} from "@angular/http";
import {Observable} from 'rxjs/Observable';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class IntegratedDatasetService {

    constructor (private http: Http, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService, 
                 private _npnPortalService: NpnPortalService) {}
    
    private _datasetUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/observations/getDatasetDetails.json';
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
            datasets => {       
                this.datasets = datasets.filter((d) => d.dataset_name === 'Legacy Lilac/Honeysuckle Data - East'
                || d.dataset_name === 'Legacy Lilac/Honeysuckle Data - West'
                || d.dataset_name === 'ADF Nature Log'
                || d.dataset_name === 'NYBG 2009-2013'
                || d.dataset_name === 'GRSM Tremont 2010-2012'
                // || d.dataset_name === 'NEON 2013-Present'
                );

                let neonDataset = datasets.filter((d) => d.dataset_name === 'NEON 2013-Present');
                // move neon data to be second
                console.log(datasets);
                // datasets.splice(0,0,datasets.splice(5, 1)[0]);
                datasets = neonDataset.concat(datasets)

                console.log(datasets);

                var nnDataset = <Dataset>{};
                nnDataset.dataset_id = -9999;
                nnDataset.dataset_name= 'Nature\'s Notebook';  
                nnDataset.dataset_description = 'Data from Nature\'s Notebook online and mobile apps';
                nnDataset.dataset_documentation_url = 'https://www.usanpn.org/results/nndocumentation';      
                this.datasets.unshift(nnDataset);

                let datasetIds = this._persistentSearchService.datasets;
                if(datasetIds) {
                    for(var datasetId of datasetIds) {
                        for(var dataset of this.datasets) {
                            if(dataset.dataset_id === datasetId)
                                dataset.selected = true;
                        }
                    }
                    this._npnPortalService.datasets = this.datasets.map(obj => Object.assign({}, obj));
                }
                
                this.ready = true;
            },
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
}