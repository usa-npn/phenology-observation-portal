import {Injectable, EventEmitter} from '@angular/core';
import {Dataset} from './dataset';
import { HttpClient } from '@angular/common/http';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class IntegratedDatasetService {

    constructor (private http: HttpClient, 
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
                );

                let neonDataset = datasets.filter((d) => d.dataset_name === 'NEON 2013-Present');
                // move neon data to be second
                this.datasets = neonDataset.concat(this.datasets)

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
        return this.http.get<Dataset[]>(this._datasetUrl);
    }

    public reset() {
        for(var dataset of this.datasets) {
            dataset.selected = false;
        }
    }
}