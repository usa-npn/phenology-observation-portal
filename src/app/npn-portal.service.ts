import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {State} from './locations/state';
import {Extent} from './locations/extent';
import {Species} from './species/species';
import {Phenophase} from './phenophases/phenophase';
import {PartnerGroup} from './partner-groups/partner-group';
import {Dataset} from './integrated-datasets/dataset'
import {AncillaryData} from "./ancillary-data/ancillaryData";
import {Config} from "./config.service";
import { OutputFieldsService } from './output-fields/output-fields.service';

@Injectable()
export class NpnPortalService {
  constructor (
    private http: HttpClient, 
    private config: Config,
    private _outputFieldsService: OutputFieldsService) {
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
      if(group.secondary_network)
        for(var secondaryGroup of group.secondary_network) {
          if(secondaryGroup.selected)
            selectedGroups.push(secondaryGroup);
          if(secondaryGroup.tertiary_network)
            for(var tertiaryGroup of secondaryGroup.tertiary_network) {
              if(tertiaryGroup.selected)
                selectedGroups.push(tertiaryGroup);
              if(tertiaryGroup.quaternary_network)
                for(var quaternaryGroup of tertiaryGroup.quaternary_network) {
                  if(quaternaryGroup.selected)
                    selectedGroups.push(quaternaryGroup);
                }
            }
        }
    }
    return selectedGroups;
  }

  getSelectedDatasets() {
    return this.datasets.filter((dataset) => dataset.selected);
  }

  // // this function is here because there are two lilac datasets combined into one checkbox for lilac
  // getSelectedDatasetIds() {
  //   let datasetIds = [];
  //   let selectedSets: Dataset[] = this.datasets.filter((dataset) => dataset.selected);
  //   for(var set of selectedSets) {
  //     datasetIds.push(set.dataset_id);
  //     // east and west lilac are combined
  //     if(set.dataset_id == 7)
  //       datasetIds.push(8);
  //   }
  //   return datasetIds;
  // }

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
    


    this.getObservationCount().subscribe(
        (observationCount: any) => {

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
          this.errorMessage = <any>error;
          console.log(this.errorMessage);
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

      if (this.startYear == null || this.endYear == null){
          
        result = 'N/a';
        
      }else{
      
        var sDate = new Date(this.startYear, this.getMonthString(this.startMonth), this.startDay);
        var eDate = new Date(this.startYear, this.getMonthString(this.endMonth), this.endDay);

        let diff:number = eDate.getTime()-sDate.getTime();
        var number_periods = ( ((diff/1000/60/60/24) + 1) / this.periodInterest) * ( (this.endYear - this.startYear) + 1 );
 
        result = number_periods * estimatedCount;
      }

      return result;
      
  }
  
    getMonthString(month){
      return new Date(Date.parse(month+" 1, 2012")).getMonth()+1;
    }

      
  

  getObservationCount() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    var data = JSON.stringify({
      downloadType: this.downloadType,
      start_date: this.startDate,
      end_date: this.endDate,
      state: this.getSelectedStates().map(function(s) { return s.state_code;}),
      bottom_left_x1: this.extent.bottom_left_x1,
      bottom_left_y1: this.extent.bottom_left_y1,
      upper_right_x2: this.extent.upper_right_x2,
      upper_right_y2: this.extent.upper_right_y2,
      species_id: this.getSelectedSpecies().map(function(s) { return s.species_id; }),
      phenophase_category: this.getSelectedPhenophases().map(function(p) { return p.phenophase_category; }),
      dataset_ids: this.getSelectedDatasets().map((dataset) => dataset.dataset_id),
      network: this.getSelectedPartnerGroups().map(function(p) { return p.network_name; }),
      stations: this.stations,
      is_magnitude: (this.downloadType == 'magnitude') ? 1 : 0
    });

    return this.http.post(this.config.getNpnPortalServerUrl() + '/npn_portal/observations/getObservationsCount.json', data, httpOptions);
  }

  //called when download is pressed //////////////////////////////////////
  downloadStatus: string = 'testing';
  download() {
    this.downloadStatus = "downloading";
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    var data = JSON.stringify({
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
      partnerGroups: this.getSelectedPartnerGroups().map((partnerGroup) => partnerGroup.network_name),
      network_ids: this.getSelectedPartnerGroups().map((partnerGroup) => partnerGroup.network_id),
      additionalFields: this._outputFieldsService.getSelectedOptionalFields().map((optionalField) => optionalField.machine_name),
      additionalFieldsDisplay: this._outputFieldsService.getSelectedOptionalFields().map((optionalField) => optionalField.field_name),
      dataset_ids: this.getSelectedDatasets().map((dataset) => dataset.dataset_id),
      integrated_datasets: this.getSelectedDatasets().map((dataset) => dataset.dataset_name),
      ancillary_data: this.getSelectedDatasheets().map((datasheet) => datasheet.name),
      qualityFlags: this._outputFieldsService.dataQualityChecksSelected() ? null : 'ignored',
      stations: this.stations
    });

    //always use https on dev/prod servers, but not necessarily locally
    this.http.post(this.config.getPopServerUrl() + this.config.getPopDownloadEndpoint(), data, httpOptions)
        .subscribe((res) => {
          console.log(res['download_path']);
          if(res['download_path'] === "error") {
            this.downloadStatus = 'error';
          }
          else {
            this.downloadStatus = 'complete';
            window.location.assign(res['download_path']);
          }
        });
  }

}
