import {Injectable, EventEmitter} from '@angular/core';
import {State} from './state';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class LocationsService {

    constructor (private http: Http) {}
    
    //server_url = location.protocol + '//' + location.hostname;

    public getNpnPortalUrl() {
        if(location.hostname.includes('local'))
            return location.protocol + '//' + location.hostname;
        if(location.hostname.includes('dev'))
            return location.protocol + "//www-dev.usanpn.org";
        else
            return location.protocol + "//www.usanpn.org";
    }
    
    private _statesUrl = this.getNpnPortalUrl() + '/npn_portal/stations/getStates.json';
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
            states => {this.states = states; console.log('states have been set'); this.ready = true;},
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