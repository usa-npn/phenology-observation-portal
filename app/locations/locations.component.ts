import {Component, OnInit} from "@angular/core";
import {State} from "./state";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {LocationsService} from "./locations.service";

declare function initMap() : void;

@Component({
  templateUrl: 'app/locations/locations.html',
  styleUrls: ['app/locations/locations.component.css'],
  directives: [ROUTER_DIRECTIVES]
})
export class LocationsComponent implements OnInit {
  constructor(private _npnPortalService: NpnPortalService,
              private _locationsService: LocationsService,
              private _router: Router) {}

  states:State[];
  tabs = [{title: 'States',
          view: 'statesView'},
          {title: 'Region Selector',
          view: 'regionView'}
        ];
  currentTab;

  onClickTab(tab) {
      this.currentTab = tab.view;
  }

  isActiveTab(tabUrl) {
      return tabUrl == this.currentTab;
  }

    toggleState(state) {
        state.selected = !state.selected;
        console.log(state)
    }
    
    removeState(state) {
        for(var s of this.states) {
            if(state.state_id === s.state_id)
                s.selected = false;
        }
    }

    deselectStates() {
        for (var i = 0; i < this.states.length; i++) {
            this.states[i].selected = false;
        }
    }

    submit() {
        if (this.isActiveTab('statesView')) {
            this._npnPortalService.extent = {bottom_left_x1: null, bottom_left_y1: null, upper_right_x2: null, upper_right_y2: null};
            this._npnPortalService.states = this.states.map(obj => Object.assign({}, obj));
        }
        else {
            this.deselectStates();
            this._npnPortalService.states = this.states.map(obj => Object.assign({}, obj));
            this._npnPortalService.extent.bottom_left_x1 = Number((<HTMLInputElement>document.getElementById("ObservationBottomLeftX1")).value);
            this._npnPortalService.extent.bottom_left_y1 = Number((<HTMLInputElement>document.getElementById("ObservationBottomLeftY1")).value);
            this._npnPortalService.extent.upper_right_x2 = Number((<HTMLInputElement>document.getElementById("ObservationUpperRightX2")).value);
            this._npnPortalService.extent.upper_right_y2 = Number((<HTMLInputElement>document.getElementById("ObservationUpperRightY2")).value);
        }
        this._npnPortalService.setObservationCount()
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    // routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    //     this.submitLocation();
    //     this._npnPortalService.activePage = next.routeName;
    //     return true;
    // }

    ngOnInit() {
        this.states =  this._locationsService.states;
        this.currentTab = this._locationsService.currentTab;
        if(this.isActiveTab('regionView')) {
            initMap();
        }
        this._locationsService.stateRemoved$.subscribe(state => {this.removeState(state); this.submit()});
        this._locationsService.submitLocations$.subscribe(() => this.submit());
    }
}
