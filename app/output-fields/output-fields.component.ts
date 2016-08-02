import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {OutputField} from "./output-field";
import {OutputFieldsService} from "./output-fields.service";


@Component({
    templateUrl: 'app/output-fields/output-fields.html',
    styleUrls: ['app/output-fields/output-fields.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class OutputFieldsComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService,
                private _outputFieldsService: OutputFieldsService,
                private _router: Router) {}

    optionalFields:OutputField[];
    climateFields:OutputField[];
    defaultFields:OutputField[];
    
    selectAllOptional:boolean;
    selectAllClimate:boolean;

    tabs = [{title: 'Optional Fields',     view: 'optionalFieldsView'},
            {title: 'Climate Data Fields', view: 'climateFieldsView'},
            {title: 'Default Data Fields', view: 'defaultFieldsView'}
    ];
    currentTab = 'optionalFieldsView';

    onClickTab(tab) {
        this.currentTab = tab.view;
    }

    isActiveTab(tabUrl) {
        return tabUrl == this.currentTab;
    }

    toggleOptionalField(optionalField) {
        optionalField.selected = !optionalField.selected;
        if(!optionalField.selected && this.selectAllOptional)
            this.selectAllOptional = false;
    }

    toggleClimateField(climateField) {
        climateField.selected = !climateField.selected;
        if(!climateField.selected && this.selectAllClimate)
            this.selectAllClimate = false;
    }
    
    selectAll() {
        if(this.currentTab === 'optionalFieldsView') {
            this.selectAllOptional = !this.selectAllOptional;
            for(var optionalField of this.optionalFields) {
                optionalField.selected = this.selectAllOptional;
            }
        }
        else if(this.currentTab === 'climateFieldsView') {
            this.selectAllClimate = !this.selectAllClimate;
            for(var climateField of this.climateFields) {
                climateField.selected = this.selectAllClimate;
            }
        }
    }
    
    removeOptionalField(optionalField:OutputField) {
        for(var field of this.optionalFields) {
            if(optionalField.machine_name === field.machine_name) {
                field.selected = false;
                this.selectAllOptional = false;
            }
        }
        for(var field of this.climateFields) {
            if(optionalField.machine_name === field.machine_name) {
                field.selected = false;
                this.selectAllClimate = false;
            }
        }
    }
    
    getQcFields() {
        return this.optionalFields.filter((field) => field.quality_check );
    }

    getNonQcFields() {
        return this.optionalFields.filter((field) => !field.quality_check );
    }

    submit() {
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
        this.selectAllOptional = this._outputFieldsService.selectAllOptional;
        this.selectAllClimate = this._outputFieldsService.selectAllClimate;
        this.optionalFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.optionalFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.optionalFieldsSummarized : this._outputFieldsService.optionalFieldsSiteLevelSummarized);
        this.climateFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.climateFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.climateFieldsSummarized : this._outputFieldsService.climateFieldsSiteLevelSummarized);
        this.defaultFields = this._npnPortalService.downloadType === "raw" ? this._outputFieldsService.defaultFieldsRaw : (this._npnPortalService.downloadType === "summarized" ? this._outputFieldsService.defaultFieldsSummarized : this._outputFieldsService.defaultFieldsSiteLevelSummarized);

        this._outputFieldsService.optionalFieldRemoved$.subscribe(optionalField => {this.removeOptionalField(optionalField); this.submit()});
        this._outputFieldsService.submitOptionalFields$.subscribe(() => this.submit());
    }
}
