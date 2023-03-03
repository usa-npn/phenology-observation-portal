import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {PartnerGroup} from "./partner-group";
import {SearchPipe} from "./search-pipe";
import {PartnerGroupsService} from "./partner-groups.service";
import { OutputFieldsService } from '../output-fields/output-fields.service';
import { PartnerGroupTag } from "./partner-group-tag";

@Component({
    templateUrl: 'partner-groups.html',
    styleUrls: ['partner-groups.component.css']
})
export class PartnerGroupsComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService,
                private _outputFieldsService: OutputFieldsService,
                private _partnerGroupsService: PartnerGroupsService,
                private _router: Router) {}

    partnerGroups:PartnerGroup[];
    partnerGroupTags:PartnerGroupTag[];
    nameFilter = this._partnerGroupsService.nameFilter;

    removeGroup(group:PartnerGroup) {
        for (var partnerGroup of this.partnerGroups) {
            if (partnerGroup.network_id === group.network_id)
                partnerGroup.selected = false;
        } 
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
        console.log(group);
    }

    toggleGroup(group:PartnerGroup) {
        var primaryUnselected:boolean = false;
        for(var partnerGroup of this.partnerGroups) {
            primaryUnselected = false;
            if(partnerGroup.network_id === group.network_id) {
                partnerGroup.selected = !partnerGroup.selected;
                if(!partnerGroup.selected) {
                    primaryUnselected = true;
                }
            }
        }
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
        console.log(group);
    }
    
    onSelect(page) {
        this._router.navigate( [page] );
    }

    checkForSubgroups(group:PartnerGroup) {
        return false;
    }

    getPanelClasses(group:PartnerGroup) {
        if(this.checkForSubgroups(group))
            return ['panel', 'panel-default'];
        else
            return [];
    }
    
    getCollapseClasses(group:PartnerGroup) {
        if(group.collapsed)
            return [];
        else
            return ['in'];
    }

    getHeadingOrBodyClasses(group:PartnerGroup) {
        if(this.checkForSubgroups(group))
            return ['panel-heading', 'panel-heading-sm'];
        else
            return ['panel-body', 'panel-body-sm'];
    }
    
    setAllCollapsed(filterText:string) {
        let collapsed = (!filterText || filterText === '') ? true : false;

        console.log(collapsed);
        if(this.partnerGroups)
            for(var partnerGroup of this.partnerGroups) {
                partnerGroup.collapsed = collapsed;
            }
    }

    toggle(group:PartnerGroup) {
        group.collapsed = !group.collapsed;

        if(this.partnerGroups)
            for(var partnerGroup of this.partnerGroups) {
                if(partnerGroup.network_id === group.network_id)
                    partnerGroup.collapsed = group.collapsed;
            }
    }

    aPartnerGroupIsSelected() {
        if(this.partnerGroups) {
            for(var partnerGroup of this.partnerGroups) {
                if(partnerGroup.selected) {
                    return true;
                }
            } 
            return false;
        }
    }
    
    submit() {
        this._outputFieldsService.togglePartnerGroupOptionalField(this.aPartnerGroupIsSelected(), this._npnPortalService.downloadType);
        this._npnPortalService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
        this._partnerGroupsService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
        this._npnPortalService.setObservationCount();
    }

    ngOnInit() {
        this.partnerGroups = this._partnerGroupsService.partnerGroups;
        this.partnerGroupTags = this._partnerGroupsService.partnerGroupTags;
        this.setAllCollapsed('');
        //this is called when removing a group from the view filters page
        this._partnerGroupsService.groupRemoved$.subscribe(group => {this.removeGroup(group); this.submit();});
        this._partnerGroupsService.submitGroups$.subscribe(() => this.submit());
    }
}
