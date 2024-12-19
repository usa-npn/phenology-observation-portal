import {Component, OnInit} from "@angular/core";
import {Router} from '@angular/router';
import {DownloadComponent} from "./download/download.component";
import {NpnPortalService} from "./npn-portal.service";
import {DateService} from "./date-range/date.service";
import {LocationsService} from "./locations/locations.service";
import {SpeciesService} from "./species/species.service";
import {PhenophasesService} from "./phenophases/phenophases.service";
import {OutputFieldsService} from "./output-fields/output-fields.service";
import {PartnerGroupsService} from "./partner-groups/partner-groups.service";
import {IntegratedDatasetService} from "./integrated-datasets/integrated-datasets.service";
import {AncillaryDataService} from "./ancillary-data/ancillary-data.service";
import {PersistentSearchService, savedSearch} from "./persistent-search.service";
import { HttpClient } from '@angular/common/http';
import { NpnUsageService } from './services/npn-usage.service'; // Ensure correct path to service

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  providers: [
      PersistentSearchService,
      DateService, 
      LocationsService, 
      SpeciesService, 
      PhenophasesService, 
      PartnerGroupsService, 
      IntegratedDatasetService, 
    //   OutputFieldsService, 
      AncillaryDataService
    ]
})
export class AppComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService, 
                private _persistentSearchService: PersistentSearchService,
                private _dateService: DateService,
                private _locationsService: LocationsService,
                private _speciesService: SpeciesService,
                private _phenophasesService: PhenophasesService,
                private _partnerGroupsService: PartnerGroupsService,
                private _integratedDatasetService: IntegratedDatasetService,
                private _outputFieldsService: OutputFieldsService,
                private _ancillaryDataService: AncillaryDataService,
                private _router: Router,
                private http: HttpClient,
                private npnUsageService: NpnUsageService // Inject NpnUsageService
                ) {
    }

//this is not currently used, written for the insertion of row in google analytics4 using measurement ID.
   /*sendAnalyticsData() {
        console.log('inside')
        const url = 'https://www.google-analytics.com/mp/collect?api_secret=secrethere&measurement_id=G-EB77TQZKT7';
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const stationIds = [53, 35, 63, 85];
    
        const payload = {
          client_id: '1859777382.1711374313',
          non_personalized_ads: false,
          events: [ 
            {
              name: 'popdownloads',
              params: {
                Download_params: '{species_id: 23, person_id: 64, station_ids: [53, 35, 63]}',
                species_id: 24,
                debug_mode: 1,
                event_timestamp: currentTimestamp
              }
            }
          ]
        };
        const headers = {
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Server': 'Golfe2',
            'Content-Type':'text/plain'
        };
        this.http.post(url, payload,{headers}).subscribe(
          (response) => {
            console.log('Analytics data sent successfully:', response);
          },
          (error) => {
            console.error('Error sending analytics data:', error);
          }
        );
      }
    
    
    //this is not currently used Method to insert the new row into npn_usage when the "Next" button is clicked, instead we are inserting the row when download button is clicked.
  insertRowAndNavigate(): void {
    const newUsage = {
      date_time: new Date().toISOString(),  // Current datetime in ISO format
      tool_id: 1,                           // tool_id for this action
      metric_id: 3                          // metric_id for "report generated"
    };

    this.npnUsageService.addNpnUsage(newUsage).subscribe(
      (response) => {
        console.log('New npn_usage row added:', response);
        this.onSelect('date-range');  // Navigate to the next page after insertion
      },
      (error) => {
        console.error('Error adding npn_usage row:', error);
      }
    );
  }*/

  onSelect(page: string) {
    if (this.allDataLoaded()) {
      if (page === "get-started" || page === "metadata" || page === "help") {
        this._npnPortalService.activePage = page;
        this._router.navigate([page]);
      } else {
        if (page === "date-range" && this.reportTypeSelected()) {
          this._npnPortalService.activePage = page;
          this._router.navigate([page]);
        }
        if (this.reportTypeSelected() && this.validDateRange()) {
          this._npnPortalService.activePage = page;
          this._router.navigate([page]);
        }
      }
    }
  }

    reportTypeSelected() {
        return this._npnPortalService.reportTypeSelected();
    }

    validDateRange() {
        return this._npnPortalService.dateRangeIsValid();
    }

    isSelected(page) {
        return page == this._npnPortalService.activePage;
    }

    allDataLoaded() {
        return this._locationsService.ready
            && this._phenophasesService.ready
            && this._speciesService.ready
            && this._partnerGroupsService.ready
            && this._integratedDatasetService.ready;
    }
    
    initializeData() {
        this._locationsService.initStates();
        this._speciesService.initSpecies();
        this._speciesService.initFunctionalTypes();
        this._partnerGroupsService.initPartnerGroups();
        this._phenophasesService.initPhenophases();
        this._integratedDatasetService.initDatasets();
        this._ancillaryDataService.initDatasheets();
    }

    // Insert the new row into npn_usage when /get-started route is loaded
    insertNpnUsageRow(): void {
        const newUsage = {
            date_time: new Date().toISOString(), // Current datetime in ISO format
            tool_id: 1,                          // tool_id for 'get-started'
            metric_id:1                         // metric_id for 'page visit'
        };

        this.npnUsageService.addNpnUsage(newUsage).subscribe(
          (response) => {
            console.log('New npn_usage row added:', response);
          },
          (error) => {
            console.error('Error adding npn_usage row:', error);
          }
        );
    }
    
    ngOnInit() {
        console.log('sending to GA');
        let searchId = this._persistentSearchService.getSearchId();
        if(searchId) {
            this._persistentSearchService.getSearch(searchId).subscribe((savedSearch: savedSearch) => {
                this.initializeData();
                //this.sendAnalyticsData();
                // Check if the current URL is /get-started and call the function
                if (window.location.pathname === '/get-started') {
                    this.insertNpnUsageRow();  // Insert the row when /get-started is loaded
                }    
            });
        } else {
            this.initializeData();
            //this.sendAnalyticsData();
            if (window.location.pathname === '/get-started') {
                this.insertNpnUsageRow();  // Insert the row when /get-started is loaded
            }
        }
    }
}
