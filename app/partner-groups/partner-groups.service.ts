import {Injectable, EventEmitter} from '@angular/core';
import {PartnerGroup} from './partner-group';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PartnerGroupsService {

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
    
    private _partnerGroupsUrl = this.getNpnPortalUrl() + '/npn_portal/networks/getNetworkTree.json';
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
            partnerGroups => {this.partnerGroups = partnerGroups; console.log('partner groups have been set'); this.ready = true;},
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