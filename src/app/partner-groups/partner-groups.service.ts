import {Injectable, EventEmitter} from '@angular/core';
import {PartnerGroup} from './partner-group';
import {PartnerGroupTag} from './partner-group-tag';
import { HttpClient } from '@angular/common/http';
import {Config} from '../config.service';
import {PersistentSearchService} from "../persistent-search.service";
import {NpnPortalService} from "../npn-portal.service";

@Injectable()
export class PartnerGroupsService {

    constructor (private http: HttpClient, 
                 private config: Config, 
                 private _persistentSearchService: PersistentSearchService, 
                 private _npnPortalService: NpnPortalService) {}

    // private _partnerGroupsUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/networks/getNetworkTree.json';
    private _partnerGroupsUrl = this.config.getWebServicesUrl() + '/v0/networks/getLpps';
    private _partnerGroupTagsUrl = this.config.getWebServicesUrl() + '/v0/networks/getLppTags';

    errorMessage: string;
    public ready:boolean = false;
    public nameFilter:string = "";
    public partnerGroups:PartnerGroup[] = [];
    public partnerGroupTags:PartnerGroupTag[] = [];
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
                            if(partnerGroup.Network_ID === partnerGroupId)
                                partnerGroup.selected = true;
                        }
                    }
                    this._npnPortalService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
                }
                
                this.ready = true;
            },
            error => this.errorMessage = <any>error)

        this.getPartnerGroupTags().subscribe(
            partnerGroupTags => {
                this.partnerGroupTags = partnerGroupTags; 
            },
            error => this.errorMessage = <any>error)
    }

    getPartnerGroups() {
        return this.http.get<PartnerGroup[]>(this._partnerGroupsUrl);
    }

    getPartnerGroupTags() {
        return this.http.get<PartnerGroupTag[]>(this._partnerGroupTagsUrl);
    }
    
    reset() {
        for (var partnerGroup of this.partnerGroups) {
            partnerGroup.selected = false;
        }
    }
}