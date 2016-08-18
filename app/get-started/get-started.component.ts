import {Component, OnInit, ViewChild} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {LocationsService} from "../locations/locations.service";
import {PhenophasesService} from "../phenophases/phenophases.service";
import {SpeciesService} from "../species/species.service";
import {PartnerGroupsService} from "../partner-groups/partner-groups.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";
import {DateService} from "../date-range/date.service";
import {IntegratedDatasetService} from "../integrated-datasets/integrated-datasets.service";
import {AncillaryDataService} from "../ancillary-data/ancillary-data.service";
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  templateUrl: 'app/get-started/get-started.html',
  styleUrls: ['app/get-started/get-started.component.css'],
  directives: [ROUTER_DIRECTIVES, MODAL_DIRECTIVES]
})
export class GetStartedComponent implements OnInit {
  constructor(private _npnPortalService: NpnPortalService, 
              private _dateService: DateService,
              private _locationsService: LocationsService, 
              private _phenophasesService: PhenophasesService,
              private _speciesService: SpeciesService,
              private _partnerGroupsService: PartnerGroupsService,
              private _outputFieldsService: OutputFieldsService,
              private _integratedDatasetService: IntegratedDatasetService,
              private _ancillaryDataService: AncillaryDataService,
              private _router: Router) {}

  @ViewChild('resetFiltersModal')
  resetFiltersModal: ModalComponent;
  
  allDataLoaded() {
    return this._locationsService.ready
        && this._phenophasesService.ready 
        && this._speciesService.ready
        && this._partnerGroupsService.ready
        && this._outputFieldsService.rawFieldsReady
        && this._outputFieldsService.summarizedFieldsReady
        && this._outputFieldsService.siteLevelSummarizedFieldsReady
  }
  
  dataLoaded() {
    var numLoaded:number = 5;
    if(this._locationsService.ready)
      numLoaded = numLoaded + 12;
    if(this._phenophasesService.ready)
      numLoaded = numLoaded + 12;
    if(this._speciesService.ready)
      numLoaded = numLoaded + 12;
    if(this._partnerGroupsService.ready)
      numLoaded = numLoaded + 12;
    if(this._outputFieldsService.rawFieldsReady)
      numLoaded = numLoaded + 12;
    if(this._outputFieldsService.summarizedFieldsReady)
      numLoaded = numLoaded + 12;
    if(this._outputFieldsService.siteLevelSummarizedFieldsReady)
      numLoaded = numLoaded + 12;
    if(this._integratedDatasetService.ready)
      numLoaded = numLoaded + 12;
    return numLoaded;
  }

  newType:string;
  resetFilters() {
    this._npnPortalService.resettingFilters = true;
    this._dateService.reset();
    this._locationsService.reset();
    this._speciesService.reset();
    this._phenophasesService.reset();
    this._partnerGroupsService.reset();
    this._integratedDatasetService.reset();
    this._outputFieldsService.reset();
    this._ancillaryDataService.reset();
    this._npnPortalService.reset();
    
    this._npnPortalService.downloadType = this.newType;
    this._npnPortalService.setObservationCount();
  }
  
  setDownloadType(type:string){
    if(this._npnPortalService.filtersAreSet() && !this._npnPortalService.allowDownloadTypeChangeWithoutReset) {
      this.resetFiltersModal.open();
      this.newType = type;
    }
    else {
      this._npnPortalService.downloadType = type;
      this._npnPortalService.setObservationCount();
    }
  }
  
  getDownloadType(){
    return this._npnPortalService.downloadType
  }
  
  downloadTypeIsSet() {
    return this._npnPortalService.downloadType == "raw"
        || this._npnPortalService.downloadType == "summarized"
        || this._npnPortalService.downloadType == "siteLevelSummarized"
  }
  
  isSelected(button) {
    return button == this._npnPortalService.downloadType;
  }

  onSelect(page) {
    if(page == "get-started" || page == "metadata" || page == "help") {
      // this._npnPortalService.activePage = page;
      this._npnPortalService.allowDownloadTypeChangeWithoutReset = false;
      this._router.navigate( [page] );
    }
    else {
      if (this._npnPortalService.reportTypeSelected()) {
        // this._npnPortalService.activePage = page;
        this._npnPortalService.allowDownloadTypeChangeWithoutReset = false;
        this._router.navigate( [page] );
      }
    }
  }
  
  ngOnInit() {
    this._npnPortalService.resettingFilters = false;
  }
  
}
