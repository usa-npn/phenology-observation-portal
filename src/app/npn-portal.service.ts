import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {State} from './locations/state';
import {Extent} from './locations/extent';
import {Species} from './species/species';
import {Phenophase} from './phenophases/phenophase';
import {PartnerGroup} from './partner-groups/partner-group';
import {Dataset} from './integrated-datasets/dataset'
import {AncillaryData} from "./ancillary-data/ancillaryData";
import {Config} from "./config.service";
import { OutputFieldsService } from './output-fields/output-fields.service';
import { TinybirdService } from './tinybird.service';
import { environment } from '../environments/environment'
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NpnPortalService {
  constructor (
    private http: HttpClient,
    private config: Config,
    private _outputFieldsService: OutputFieldsService,
    private _tinybirdService: TinybirdService) {
    }

  activePage = "get-started";
  downloadType:string;
  fromVizTool = false;
  allowDownloadTypeChangeWithoutReset:boolean = false;
  errorMessage: string;
  extent:Extent = {bottom_left_x1: null, bottom_left_y1: null, upper_right_x2: null, upper_right_y2: null};
  states:State[] = [];
  species:Species[] = [];
  phenophases:Phenophase[] = [];
  partnerGroups:PartnerGroup[] = [];
  datasets:Dataset[] = [];
  datasheets:AncillaryData[] = [];

  stations = [];

  observationCount;
  countRequestId = 0;
  startDate = null;
  endDate = null;

  rangeType:string;
  startDay:number;
  endDay:number;
  startMonth:string;
  endMonth:string;
  startYear:number;
  endYear:number;
  
  dataPrecision:number;
  periodInterest:any;
  resettingFilters:boolean = false;
  
  filtersAreSet(): boolean {
    if(this.startDate !== null 
        || this.endDate !== null
        || this.getSelectedStates().length > 0 
        || this.extent.bottom_left_x1 !== null
        || this.getSelectedSpecies().length > 0
        || this.getSelectedPhenophases().length > 0
        || this.getSelectedPartnerGroups().length > 0
        || this._outputFieldsService.getSelectedOptionalFields().length > 0 
        || this.getSelectedDatasets().length > 0
        || this.getSelectedDatasheets().length > 0)
        return true;
    else
      return false;
  }

  reset() {
    this.downloadType = null;
    this.errorMessage = null;
    this.extent = {bottom_left_x1: null, bottom_left_y1: null, upper_right_x2: null, upper_right_y2: null};
    this.states = [];
    
    this.species.forEach(obj => obj.selected=false);
    
    this.phenophases = [];
    this.partnerGroups = [];
    this.datasets = [];
    this._outputFieldsService.optionalFields = [];
    this.datasheets = [];
    this.observationCount = null;
    this.startDate = null;
    this.endDate = null;
    this.startYear = null;
    this.endYear = null;
    this.dataPrecision = null;
    this.periodInterest = null;
  }

  getReportType():string {
    if(this.downloadType === 'raw'){
        return 'Status and Intensity';
    }
    else if(this.downloadType === 'summarized'){
        return 'Individual Phenometrics';
    }
    else if (this.downloadType === 'magnitude'){
        return 'Magnitude Phenometrics'
    }else{
        return 'Site Phenometrics';
    }
  }

  getSelectedStates() {
    return this.states.filter(function(s) {
      return s.selected;
    });
  }
  
  getSelectedExtent() {
    return this.extent;
  }
  
  getSelectedSpecies() {
    return this.species.filter(function(s) {
      return s.selected;
    });
  }

  getSelectedPhenophases() {
    return this.phenophases.filter(function(p) {
      return p.selected;
    });
  }
  
  getSelectedPartnerGroups() {
    let selectedGroups:PartnerGroup[] = [];

    for(var group of this.partnerGroups) {
      if(group.selected)
        selectedGroups.push(group);
    }
    return selectedGroups;
  }

  getSelectedDatasets() {
    return this.datasets.filter((dataset) => dataset.selected);
  }

  // this function is here because the "Nature's Notebook" checkbox (id -9999, the Java app)
  // also needs to include the Nature's Notebook mobile app data (id 3)
  getSelectedDatasetIds() {
    let datasetIds = [];
    for(var set of this.getSelectedDatasets()) {
      datasetIds.push(set.dataset_id);
      // the Nature's Notebook checkbox covers both the Java app (-9999) and the mobile app (3)
      if(set.dataset_id == -9999)
        datasetIds.push(3);
    }
    return datasetIds;
  }

  getSelectedDatasheets() {
    return this.datasheets.filter((datasheet) => datasheet.selected)
  }

  reportTypeSelected() {
    return this.downloadType === "raw"
        || this.downloadType === "summarized"
        || this.downloadType === "siteLevelSummarized"
        || this.downloadType === "magnitude";
  }

  dateRangeIsValid() {
    return this.downloadType === 'raw' || (this.startDate && this.endDate);
  }

  //functions to populate filter text /////////////////////////////////////////////////////////////////////////////////
  getDateFilter() {
    if(this.startDate && this.endDate)
      return this.startDate + ' - ' + this.endDate;
    else
      return "";
  }
  
  getExtentFilter() {
    if(this.extent.bottom_left_x1)
      return 1;
    else
      return 0;
  }
  
  getBottomLeftConstraint() {
    if(this.getExtentFilter())
        return '(' + this.extent.bottom_left_x1 + ', ' + this.extent.bottom_left_y1 + ')';
    else 
    return null;
  }

  getUpperRightConstraint() {
    if(this.getExtentFilter())
      return '(' + this.extent.upper_right_x2 + ', ' + this.extent.upper_right_y2 + ')';
    else
      return null;
  }

  setObservationCount() {

    this.observationCount = -1;

    const requestId = ++this.countRequestId;

    this.getObservationCount().subscribe(
        (observationCount: any) => {
          if (requestId !== this.countRequestId) return;

          let estimatedCount = observationCount.obsCount;

          if(this.downloadType === 'summarized'){
              estimatedCount = estimatedCount / 20;
          }

          if(this.downloadType === 'siteLevelSummarized'){
            estimatedCount = estimatedCount / 115;
          }

          if(this.downloadType === 'magnitude'){
            estimatedCount = this.getMagnitudeEstimate(estimatedCount);
          }

          this.observationCount = this.roundEstimate(estimatedCount);
        },
        (error) => {
          if (requestId !== this.countRequestId) return;

          this.errorMessage = <any>error;
          console.log(this.errorMessage);
          this.observationCount = 'N/a';
        })

  }
  
  roundEstimate(estimatedCount : any){
      
    let estimate : string;
    
    if (estimatedCount == "N/a"){
        estimate = estimatedCount;
    }
    else if(estimatedCount < 1000){
      estimate = Math.round(estimatedCount) + '';
    }
    else if(estimatedCount < 1000000) {
      let numInThousands = estimatedCount / 1000;
      estimate = (Math.round( numInThousands * 10 ) / 10).toFixed(1).toString() + ' K';
    }
    else {
      let numInMillions = estimatedCount / 1000000;
      estimate = (Math.round( numInMillions * 10 ) / 10).toFixed(1).toString() + ' M';
    }
    
    return estimate;
  }
  
  getMagnitudeEstimate(estimatedCount : number){
      var result : any;

      if (this.startDate == null || this.endDate == null){
        result = 'N/a';
        
      }else{
        var sDate = new Date(this.startDate);
        var eDate = new Date(this.endDate);

        let diff:number = eDate.getTime()-sDate.getTime();
        var number_periods = ( ((diff/1000/60/60/24) + 1) / this.periodInterest);
 
        result = number_periods * estimatedCount;
      }

      return result;
      
  }
  
    getMonthString(month){
      return new Date(Date.parse(month+" 1, 2012")).getMonth()+1;
    }

  getObservationCount() {
    if (this.downloadType === 'raw' || this.downloadType === 'summarized') {
      return this._tinybirdService.getCount(
          this.config.getObservationCountUrl(), this.buildCountParams())
        .pipe(map((total: number) => ({ obsCount: total })));
    }
    return of({ obsCount: 50000000 }); // other types: mock until their retrofits land
  }

  buildCountParams(): HttpParams {
    let params = new HttpParams();

    if (this.startDate) {
      params = params.set('start_date', this.startDate);
    }
    if (this.endDate) {
      params = params.set('end_date', this.endDate);
    }

    const speciesIds = this.getSelectedSpecies().map((s) => s.species_id).join(',');
    if (speciesIds) {
      params = params.set('species_ids', speciesIds);
    }

    const phenophaseCategories = this.getSelectedPhenophases().map((p) => p.phenophase_category).join(',');
    if (phenophaseCategories) {
      params = params.set('phenophase_short_names', phenophaseCategories);
    }

    const networkIds = this.getSelectedPartnerGroups().map((g) => g.Network_ID).join(',');
    if (networkIds) {
      params = params.set('network_ids', networkIds);
    }

    const datasetIds = this.getSelectedDatasetIds().join(',');
    if (datasetIds) {
      params = params.set('dataset_ids', datasetIds);
    }

    const stateCodes = this.getSelectedStates().map((s) => s.state_code).join(',');
    if (stateCodes) {
      params = params.set('states', stateCodes);
    }

    if (this.extent.bottom_left_x1 !== null) {
      params = params.set('bottom_left_lat', String(this.extent.bottom_left_x1));
      params = params.set('bottom_left_lng', String(this.extent.bottom_left_y1));
      params = params.set('upper_right_lat', String(this.extent.upper_right_x2));
      params = params.set('upper_right_lng', String(this.extent.upper_right_y2));
    }

    return params;
  }

  pollJobStatus(jobId: string, startTime: number): void {
    const elapsed = Date.now() - startTime;
    if (elapsed >= 935000) {
      this.downloadStatus = 'error';
      return;
    }
    this.http.get<any>(this.config.getStatusEndpoint() + '/' + jobId)
      .subscribe((res: any) => {
        if (res.status === 'complete') {
          this.downloadStatus = 'complete';
          window.location.assign(res.download_url);
        } else if (res.status === 'failed') {
          this.downloadStatus = 'error';
        } else {
          const nextDelay = elapsed < 35000 ? 10000 : 120000;
          setTimeout(() => this.pollJobStatus(jobId, startTime), nextDelay);
        }
      }, () => {
        this.downloadStatus = 'error';
      });
  }

  //called when download is pressed //////////////////////////////////////
  downloadStatus: string = 'testing';
  download() {
    this.downloadStatus = "downloading";

    const usesFlags = this.downloadType === 'raw' || this.downloadType === 'summarized';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    const payload: any = {
      downloadType: this.getReportType(),
      startDate: this.startDate,
      endDate: this.endDate,
      num_days_quality_filter: this.dataPrecision,
      frequency: ((this.periodInterest == 30) ? 'months' : this.periodInterest),
      state: this.getSelectedStates().map((state) => state.state_code),
      bottom_left_x1: this.extent.bottom_left_x1,
      bottom_left_y1: this.extent.bottom_left_y1,
      upper_right_x2: this.extent.upper_right_x2,
      upper_right_y2: this.extent.upper_right_y2,
      bottom_left_constraint: this.getBottomLeftConstraint(),
      upper_right_constraint: this.getUpperRightConstraint(),
      species_ids: this.getSelectedSpecies().map((species) => species.species_id),
      species_names: this.getSelectedSpecies().map((s) => { return s.common_name + ' ('  + s.genus + ' ' + s.species + ')' }),
      phenophaseCategories: this.getSelectedPhenophases().map((phenophase) => phenophase.phenophase_category),
      partnerGroups: this.getSelectedPartnerGroups().map((partnerGroup) => partnerGroup.Name),
      network_ids: this.getSelectedPartnerGroups().map((partnerGroup) => partnerGroup.Network_ID),
      additionalFields: this._outputFieldsService.getSelectedOptionalFields().map((optionalField) => optionalField.machine_name),
      additionalFieldsDisplay: this._outputFieldsService.getSelectedOptionalFields().map((optionalField) => optionalField.field_name),
      dataset_ids: this.getSelectedDatasetIds(),
      integrated_datasets: this.getSelectedDatasets().map((dataset) => dataset.dataset_name),
      ancillary_data: this.getSelectedDatasheets()
        .map((datasheet) => datasheet.name)
        // Site Visit Details isn't available for Individual Phenometrics; strip it defensively
        // in case a saved search carries it over.
        .filter((name) => !(this.downloadType === 'summarized' && name === 'Site Visit Details')),
      qualityFlags: this._outputFieldsService.dataQualityChecksSelected() ? null : 'ignored',
      stations: this.stations
    };

    if (usesFlags) {
      Object.assign(payload, this._outputFieldsService.getSelectedIncludeFlags(this.downloadType));
    } else {
      payload.additionalFields = this._outputFieldsService.getSelectedOptionalFields().map((f) => f.machine_name);
      payload.additionalFieldsDisplay = this._outputFieldsService.getSelectedOptionalFields().map((f) => f.field_name);
    }

    const data = JSON.stringify(payload);

    console.log("Making download request: "  + this.config.getLambdaEndpoint());

    this.http.post(this.config.getLambdaEndpoint(), data, httpOptions)
        .subscribe((res: any) => {
          console.log("Got response from lambda: ");
          console.log(res);
          if (res.job_id != null) {
            const startTime = Date.now();
            setTimeout(() => this.pollJobStatus(res.job_id, startTime), 5000);
          } else {
            this.downloadStatus = 'error';
          }
        }, (err) => {
          this.downloadStatus = 'error';
        });
  }

}
