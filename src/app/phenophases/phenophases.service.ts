import {Injectable, EventEmitter} from '@angular/core';
import {Phenophase} from './phenophase';
import { HttpClient } from '@angular/common/http';
import { forkJoin, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class PhenophasesService {

    constructor (private http: HttpClient, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService, 
                 private _npnPortalService: NpnPortalService) {}

    private _phenophasesUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/phenophases/getPhenophases.json';
    errorMessage: string;
    public ready:boolean = false;
    // See LocationsService.ready$.
    public ready$ = new ReplaySubject<boolean>(1);
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
        // Runs concurrently with the saved-search fetch - see LocationsService.initStates().
        forkJoin([this.getPhenophases(), this._persistentSearchService.restored$.pipe(first())]).subscribe(
            ([phenophases]) => {
                this.phenophases = phenophases;
                console.log('phenophases have been set');

                let phenophaseIds = this._persistentSearchService.phenophases;
                if(phenophaseIds) {
                    for(var phenophaseId of phenophaseIds) {
                        for(var phenophase of this.phenophases) {
                            if(phenophase.phenophase_id === phenophaseId)
                                phenophase.selected = true;
                        }
                    }
                    this._npnPortalService.phenophases = this.phenophases.map(obj => Object.assign({}, obj));
                }
                
                this.ready = true;
                this.ready$.next(true);
            },
            error => this.errorMessage = <any>error)
    }

    getPhenophases() {
        return this.http.get<Phenophase[]>(this._phenophasesUrl);
    }
    
    reset() {
        for(var phenophase of this.phenophases) {
            phenophase.selected = false;
        }
    }
}
