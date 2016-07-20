import {Component} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {NpnPortalService} from "../npn-portal.service";
import {LocationsService} from "../locations/locations.service";
import {PhenophasesService} from "../phenophases/phenophases.service";
import {SpeciesService} from "../species/species.service";
import {PartnerGroupsService} from "../partner-groups/partner-groups.service";
import {OutputFieldsService} from "../output-fields/output-fields.service";

@Component({
  templateUrl: 'app/get-started/get-started.html',
  styleUrls: ['app/get-started/get-started.component.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class GetStartedComponent {
  constructor(private _npnPortalService: NpnPortalService, 
              private _locationsService: LocationsService, 
              private _phenophasesService: PhenophasesService,
              private _speciesService: SpeciesService,
              private _partnerGroupsService: PartnerGroupsService,
              private _outputFieldsService: OutputFieldsService,
              private _router: Router) {}
  
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
      numLoaded = numLoaded + 15;
    if(this._phenophasesService.ready)
      numLoaded = numLoaded + 15;
    if(this._speciesService.ready)
      numLoaded = numLoaded + 15;
    if(this._partnerGroupsService.ready)
      numLoaded = numLoaded + 15;
    if(this._outputFieldsService.rawFieldsReady)
      numLoaded = numLoaded + 15;
    if(this._outputFieldsService.summarizedFieldsReady)
      numLoaded = numLoaded + 15;
    if(this._outputFieldsService.siteLevelSummarizedFieldsReady)
      numLoaded = numLoaded + 15;
    return numLoaded;
  }
  
  setDownloadType(type:string){
    console.log('in set download type');
    this._npnPortalService.downloadType = type;
    this._npnPortalService.setObservationCount();
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
    if(page == "GetStarted" || page == "Metadata" || page == "Help") {
      this._npnPortalService.activePage = page;
      this._router.navigate( [page] );
    }
    else {
      if (this._npnPortalService.reportTypeSelected()) {
        this._npnPortalService.activePage = page;
        this._router.navigate( ['/'+page] );
      }
    }
  }
}
