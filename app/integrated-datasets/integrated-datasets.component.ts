import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES, CanDeactivate, ComponentInstruction} from "@angular/router-deprecated";
import {NpnPortalService} from "../npn-portal.service";
import {Dataset} from "./dataset";
import {IntegratedDatasetService} from "./integrated-datasets.service";

@Component({
    templateUrl: 'app/integrated-datasets/integrated-datasets.html',
    styleUrls: ['app/integrated-datasets/integrated-datasets.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class IntegratedDatasetsComponent implements OnInit, CanDeactivate {
    constructor(private _router: Router,
                private _npnPortalService: NpnPortalService,
                private _integratedDatasetService: IntegratedDatasetService) {}

    datasets:Dataset[]; 
    
    toggleDataset(dataset:Dataset) {
        dataset.selected = !dataset.selected;
    }

    removeDataset(dataset:Dataset) {
        for(var d of this.datasets) {
            if(dataset.id === d.id)
                d.selected = false;
        }
    }

    submitDatasets() {
        this._npnPortalService.datasets = this.datasets.map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        this.submitDatasets();
        this._npnPortalService.activePage = next.routeName;
        return true;
    }

    ngOnInit() {
        this.datasets =  this._integratedDatasetService.datasets;
        this._integratedDatasetService.datasetRemoved$.subscribe(dataset => {this.removeDataset(dataset); this.submitDatasets()});
        this._integratedDatasetService.submitDatasets$.subscribe(() => this.submitDatasets());
    }
}
