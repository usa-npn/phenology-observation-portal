import {Injectable, EventEmitter} from '@angular/core';
import {Phenophase} from './phenophase';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PhenophasesService {

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
    
    private _phenophasesUrl = this.getNpnPortalUrl() + '/npn_portal/phenophases/getPhenophases.json';
    errorMessage: string;
    public ready:boolean = false;
    public phenophases:Phenophase[] = [];
    public phenophaseRemoved$ = new EventEmitter();
    public submitPhenophases$ = new EventEmitter();

    public removePhenophase(phenophase:Phenophase): void {
        this.phenophaseRemoved$.emit(phenophase);
    }

    public submitPhenophases(): void {
        this.submitPhenophases$.emit({});
    }

    initPhenophases() {
        this.getPhenophases().subscribe(
            phenophases => {this.phenophases = phenophases; console.log('phenophases have been set'); this.ready = true;},
            error => this.errorMessage = <any>error)
    }

    getPhenophases() {
        return this.http.get(this._phenophasesUrl)
            .map(res => <Phenophase[]> res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    
    reset() {
        for(var phenophase of this.phenophases) {
            phenophase.selected = false;
        }
    }
}
