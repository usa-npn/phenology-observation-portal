import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {State} from './locations/state';
import {Extent} from './locations/extent';
import {Species} from './species/species';
import {Phenophase} from './phenophases/phenophase';
import {PartnerGroup} from './partner-groups/partner-group';
import {Dataset} from './integrated-datasets/dataset'
import {OutputField} from './output-fields/output-field';
import {Observable} from 'rxjs/Observable';
import {AncillaryData} from "./ancillary-data/ancillaryData";
import {Config} from "./config.service";

@Injectable()
export class NpnPortalService {
  constructor (private http: Http, private config: Config) {}

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
  optionalFields:OutputField[] = [];
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
  periodInterest:number;
  resettingFilters:boolean = false;
  
  filtersAreSet(): boolean {
    if(this.startDate !== null 
        || this.endDate !== null
        || this.getSelectedStates().length > 0 
        || this.extent.bottom_left_x1 !== null
        || this.getSelectedSpecies().length > 0
        || this.getSelectedPhenophases().length > 0
        || this.getSelectedPartnerGroups().length > 0
        || this.getSelectedOptionalFields().length > 0 
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
    this.optionalFields = [];
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

  getSelectedOptionalFields() {
    return this.optionalFields.filter(function(f) {
      return f.selected;
    })
  }

  dataQualityChecksSelected() {
    for (var field of this.optionalFields) {
      if (field.selected && field.machine_name === 'observed_status_conflict_flag')
          return true;
    }
    return false
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
    
    if(this.downloadType === "magnitude"){
        this.observationCount = this.roundEstimate(this.getMagnitudeEstimate());
    }else{

        this.getObservationCount().subscribe(
            (observationCount: any) => {
              console.log('observationCount = ' + observationCount.obsCount);
              let estimatedCount = observationCount.obsCount;
              if(this.downloadType === 'summarized')
                  estimatedCount = estimatedCount / 20;
              if(this.downloadType === 'siteLevelSummarized')
                estimatedCount = estimatedCount / 115;
                
              this.observationCount = this.roundEstimate(estimatedCount);
            },
            (error) => {
              this.errorMessage = <any>error;
              console.log(this.errorMessage);
            })
    }
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
  
  getMagnitudeEstimate(){
      
      console.log("Selected species:");
      console.log(this.getSelectedSpecies());
      console.log(this.species);
      
      var num_species = (this.getSelectedSpecies().length > 0) ? this.getSelectedSpecies().length : this.species.length;
      var average_phenophases_per_species = 12;
      var num_phenophases = (this.getSelectedPhenophases().length > 0) ? (this.getSelectedPhenophases().length * 2) : average_phenophases_per_species;
      var result : any;
      
      console.log("num species: " + num_species);
      console.log("num pheno:" + num_phenophases);
      
      
      if (this.startYear == null || this.endYear == null){
          
        result = 'N/a';
        
      }else{
      
        var sDate = new Date(this.startYear, this.getMonthString(this.startMonth), this.startDay);
        var eDate = new Date(this.startYear, this.getMonthString(this.endMonth), this.endDay);

        let diff:number = eDate.getTime()-sDate.getTime();
        var number_periods = ( ((diff/1000/60/60/24) + 1) / this.periodInterest) * ( (this.endYear - this.startYear) + 1 );
        result = number_periods * num_phenophases * num_species;
      }

      return result;
      
  }
  
    getMonthString(month){
      return new Date(Date.parse(month+" 1, 2012")).getMonth()+1;
    }

      
  

  getObservationCount() {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
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
      stations: this.stations
    });

    return this.http.post(this.config.getNpnPortalServerUrl() + '/npn_portal/observations/getObservationsCount.json', data, { headers: headers })
        .map(res => res.json())
        .catch(this.handleError);
  }

  private handleError (error: Response) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }

  //called when download is pressed //////////////////////////////////////
  downloadStatus: string = 'testing';
  download() {
    this.downloadStatus = "downloading";
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    var data = JSON.stringify({
      downloadType: this.getReportType(),
      startDate: this.startDate,
      endDate: this.endDate,
      num_days_quality_filter: this.dataPrecision,
      frequency: this.periodInterest,
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
      additionalFields: this.getSelectedOptionalFields().map((optionalField) => optionalField.machine_name),
      additionalFieldsDisplay: this.getSelectedOptionalFields().map((optionalField) => optionalField.field_name),
      dataset_ids: this.getSelectedDatasets().map((dataset) => dataset.dataset_id),
      integrated_datasets: this.getSelectedDatasets().map((dataset) => dataset.dataset_name),
      ancillary_data: this.getSelectedDatasheets().map((datasheet) => datasheet.name),
      qualityFlags: this.dataQualityChecksSelected() ? null : 'ignored',
      stations: this.stations
    });

    //always use https on dev/prod servers, but not necessarily locally
    this.http.post(this.config.getPopServerUrl() + this.config.getPopDownloadEndpoint(), data, { headers: headers })
            // .replace("http://data-dev", "https://data-dev") 
            // .replace("http://data.usanpn", "https://data.usanpn") + this.config.getPopDownloadEndpoint(), data, { headers: headers })
        .subscribe((res:Response) => {
          console.log(res.json().download_path);
          if(res.json().download_path === "error") {
            this.downloadStatus = 'error';
          }
          else {
            this.downloadStatus = 'complete';
            window.location.assign(res.json().download_path);
          }
        });
  }

}
