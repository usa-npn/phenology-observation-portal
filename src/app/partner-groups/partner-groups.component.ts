import {Component, OnInit, ɵɵinjectPipeChangeDetectorRef} from "@angular/core";
import {Router} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {PartnerGroup} from "./partner-group";
import {SearchPipe} from "./search-pipe";
import {PartnerGroupTagFilter} from "./partner-groups-tag-pipe";
import {PartnerGroupsService} from "./partner-groups.service";
import { OutputFieldsService } from '../output-fields/output-fields.service';
import { PartnerGroupTag } from "./partner-group-tag";

@Component({
    templateUrl: 'partner-groups.html',
    styleUrls: ['partner-groups.component.css'],
    providers: [SearchPipe]
})
export class PartnerGroupsComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService,
                private _outputFieldsService: OutputFieldsService,
                private _partnerGroupsService: PartnerGroupsService,
                private _searchPipe: SearchPipe,
                private _router: Router) {}

    partnerGroups:PartnerGroup[];
    partnerGroupTags:PartnerGroupTag[];
    nameFilter = this._partnerGroupsService.nameFilter;
    selectAll:boolean = false;
    selectedTags:PartnerGroupTag[] = [];
    partnerGroupTagsParent:PartnerGroupTag[] = [];

    removeGroup(group:PartnerGroup) {
        for (var partnerGroup of this.partnerGroups) {
            if (partnerGroup.Network_ID === group.Network_ID)
                partnerGroup.selected = false;
        } 
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
    }

    toggleGroup(group:PartnerGroup) {
        group.selected = !group.selected;

        for(var partnerGroup of this.partnerGroups) {
            if(partnerGroup.Network_ID === group.Network_ID) {
                partnerGroup.selected = group.selected;
            }
        }
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
    }

    toggleSelectAll() {
        this.selectAll = !this.selectAll;
        var filteredGroups:PartnerGroup[] = this._searchPipe.transform(this.partnerGroups, this.nameFilter, this.selectedTags, this.partnerGroupTagsParent);
        for (var filter of filteredGroups) {
            var groupIndex = this.partnerGroups.findIndex((group => group.Network_ID == filter.Network_ID))
            if(this.selectAll)
                this.partnerGroups[groupIndex].selected = true;
            else
                this.partnerGroups[groupIndex].selected = false;
        }
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
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
    
    filterChange() {
        this.selectAll = false;
    }

    toggle(group:PartnerGroup) {
        group.collapsed = !group.collapsed;

        if(this.partnerGroups)
            for(var partnerGroup of this.partnerGroups) {
                if(partnerGroup.Network_ID === group.Network_ID)
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
        //this is called when removing a group from the view filters page
        this._partnerGroupsService.groupRemoved$.subscribe(group => {this.removeGroup(group); this.submit();});
        this._partnerGroupsService.submitGroups$.subscribe(() => this.submit());
    }

    ngAfterViewInit() {
        $('.bs-select').selectpicker();
      }  
    
}
