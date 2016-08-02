import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {Dataset} from "./dataset";
import {IntegratedDatasetService} from "./integrated-datasets.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";
import {OutputField} from "../output-fields/output-field";

@Component({
    templateUrl: 'app/integrated-datasets/integrated-datasets.html',
    styleUrls: ['app/integrated-datasets/integrated-datasets.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class IntegratedDatasetsComponent implements OnInit {
    constructor(private _router: Router,
                private _npnPortalService: NpnPortalService,
                private _integratedDatasetService: IntegratedDatasetService,
                private _outputFieldsService: OutputFieldsService) {}

    datasets:Dataset[];
    optionalFields:OutputField[];
    climateFields:OutputField[];
    
    toggleDataset(dataset:Dataset) {
        dataset.selected = !dataset.selected;
        if(dataset.selected) {
            for(var field of this.optionalFields) {
                if ("dataset_id" === field.machine_name) {
                    field.selected = true;
                }
            }
        }
    }

    removeDataset(dataset:Dataset) {
        for(var d of this.datasets) {
            if(dataset.dataset_id === d.dataset_id)
                d.selected = false;
        }
    }

    submit() {
        this._npnPortalService.datasets = this.datasets.map(obj => Object.assign({}, obj));
        this._npnPortalService.optionalFields = this.optionalFields.concat(this.climateFields).map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    // routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    //     this.submit();
    //     this._npnPortalService.activePage = next.routeName;
    //     return true;
    // }

    ngOnInit() {
        this.datasets =  this._integratedDatasetService.datasets;
        this.optionalFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.optionalFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.optionalFieldsSummarized : this._outputFieldsService.optionalFieldsSiteLevelSummarized);
        this.climateFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.climateFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.climateFieldsSummarized : this._outputFieldsService.climateFieldsSiteLevelSummarized);
        this._integratedDatasetService.datasetRemoved$.subscribe(dataset => {this.removeDataset(dataset); this.submit()});
        this._integratedDatasetService.submitDatasets$.subscribe(() => this.submit());
    }
}
