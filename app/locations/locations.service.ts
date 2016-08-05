import {Injectable, EventEmitter} from '@angular/core';
import {State} from './state';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class LocationsService {

    constructor (private http: Http, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService,
                 private _npnPortalService: NpnPortalService) {}
    
    private _statesUrl = this.config.getServerUrl() + '/npn_portal/stations/getStates.json';
    errorMessage: string;
    public ready:boolean = false;
    public states:State[] = [];
    currentTab:string = 'statesView';
    public stateRemoved$ = new EventEmitter();
    public submitLocations$ = new EventEmitter();

    public removeState(state:State): void {
        this.stateRemoved$.emit(state);
    }

    public submitLocations(): void {
        this.submitLocations$.emit({});
    }
    
    initStates() {
        this.getStates().subscribe(
            states => {
                this.states = states; 
                console.log('states have been set');
                let stateIds = this._persistentSearchService.states;
                if(stateIds) {
                    for(var stateId of stateIds) {
                        for(var state of this.states) {
                            if(state.state_id === stateId)
                                state.selected = true;
                        }
                    }
                    this._npnPortalService.states = this.states.map(obj => Object.assign({}, obj));
                }
                this.ready = true;
            },
            error => this.errorMessage = <any>error)
    }

    getStates() {
        return this.http.get(this._statesUrl)
            .map(res => <State[]> res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    
    public reset() {
        for(var state of this.states) {
            state.selected = false;
        }
        this.currentTab = 'statesView';
    }
}