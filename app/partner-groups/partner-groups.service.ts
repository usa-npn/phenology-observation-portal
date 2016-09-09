import {Injectable, EventEmitter} from '@angular/core';
import {PartnerGroup} from './partner-group';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class PartnerGroupsService {

    constructor (private http: Http, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService, 
                 private _npnPortalService: NpnPortalService) {}

    private _partnerGroupsUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/networks/getNetworkTree.json';
    errorMessage: string;
    public ready:boolean = false;
    public nameFilter:string = "";
    public partnerGroups:PartnerGroup[] = [];
    public groupRemoved$ = new EventEmitter();
    public submitGroups$ = new EventEmitter();

    public removeGroup(group: PartnerGroup): void {
        this.groupRemoved$.emit(group);
    }
    
    public submitGroups(): void {
        this.submitGroups$.emit({});
    }

    initPartnerGroups() {
        this.getPartnerGroups().subscribe(
            partnerGroups => {
                this.partnerGroups = partnerGroups; 
                console.log('partner groups have been set');

                let partnerGroupIds = this._persistentSearchService.partnerGroups;
                if(partnerGroupIds) {
                    for(var partnerGroupId of partnerGroupIds) {
                        for(var partnerGroup of this.partnerGroups) {
                            if(partnerGroup.network_id === partnerGroupId)
                                partnerGroup.selected = true;
                            if(partnerGroup.secondary_network)
                                for (var secondaryGroup of partnerGroup.secondary_network) {
                                    if(secondaryGroup.network_id === partnerGroupId)
                                        secondaryGroup.selected = true;
                                    if(secondaryGroup.tertiary_network)
                                        for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                                            if(tertiaryGroup.network_id === partnerGroupId)
                                                tertiaryGroup.selected = true;
                                            if(tertiaryGroup.quaternary_network)
                                                for (var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                                    if(quaternaryGroup.network_id === partnerGroupId)
                                                        quaternaryGroup.selected = true;
                                                }
                                        }
                                }
                        }
                    }
                    this._npnPortalService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
                }
                
                this.ready = true;
            },
            error => this.errorMessage = <any>error)
    }

    getPartnerGroups() {
        return this.http.get(this._partnerGroupsUrl)
            .map(res => <PartnerGroup[]> res.json())
            .catch(this.handleError);
    }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    
    reset() {
        for (var partnerGroup of this.partnerGroups) {
            partnerGroup.selected = false;
            if(partnerGroup.secondary_network)
                for (var secondaryGroup of partnerGroup.secondary_network) {
                    secondaryGroup.selected = false;
                    if(secondaryGroup.tertiary_network)
                        for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                            tertiaryGroup.selected = false;
                            if(tertiaryGroup.quaternary_network)
                                for (var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                    quaternaryGroup.selected = false;
                                }
                        }
                }
        }
    }
}