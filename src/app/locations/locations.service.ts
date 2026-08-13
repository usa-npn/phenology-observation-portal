import {Injectable, EventEmitter} from '@angular/core';
import {State} from './state';
import { HttpClient } from '@angular/common/http';
import { forkJoin, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class LocationsService {

    constructor (private http: HttpClient, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService,
                 private _npnPortalService: NpnPortalService) {}
    
    private _statesUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/stations/getStates.json';
    errorMessage: string;
    public ready:boolean = false;
    // Observable twin of `ready`, for callers that need to act the moment the restored selections
    // have been copied onto NpnPortalService rather than poll a flag from a template.
    public ready$ = new ReplaySubject<boolean>(1);
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
        // Runs concurrently with the saved-search fetch; forkJoin holds the restored selections
        // back until both have landed, whichever order that happens in.
        forkJoin([this.getStates(), this._persistentSearchService.restored$.pipe(first())]).subscribe(
            ([states]) => {
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
                this.ready$.next(true);
            },
            error => this.errorMessage = <any>error)
    }

    getStates() {
        return this.http.get<State[]>(this._statesUrl);
    }
    
    public reset() {
        for(var state of this.states) {
            state.selected = false;
        }
        this.currentTab = 'statesView';
    }
}