import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES, CanDeactivate, ComponentInstruction} from "@angular/router-deprecated";
import {NpnPortalService} from "../npn-portal.service";
import {PartnerGroup} from "./partner-group";
import {SearchPipe} from "./search-pipe";
import {PartnerGroupsService} from "./partner-groups.service";

@Component({
    pipes: [SearchPipe],
    templateUrl: 'app/partner-groups/partner-groups.html',
    styleUrls: ['app/partner-groups/partner-groups.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class PartnerGroupsComponent implements OnInit, CanDeactivate {
    constructor(private _npnPortalService: NpnPortalService,
                private _partnerGroupsService: PartnerGroupsService,
                private _router: Router) {}

    partnerGroups:PartnerGroup[];
    nameFilter = this._partnerGroupsService.nameFilter;

    removeGroup(group:PartnerGroup) {
        for (var partnerGroup of this.partnerGroups) {
            if (partnerGroup.network_id === group.network_id)
                partnerGroup.selected = false;
            if (partnerGroup.secondary_network)
                for (var secondaryGroup of partnerGroup.secondary_network) {
                    if (secondaryGroup.network_id === group.network_id)
                        secondaryGroup.selected = false;
                    if (secondaryGroup.tertiary_network)
                        for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                            if (tertiaryGroup.network_id === group.network_id)
                                tertiaryGroup.selected = false;
                            if (tertiaryGroup.quaternary_network)
                                for (var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                    if (quaternaryGroup.network_id === group.network_id)
                                        quaternaryGroup.selected = false;
                                }
                        }
                }
        } 
        var temp:PartnerGroup[] = JSON.parse(JSON.stringify(this.partnerGroups));
        this.partnerGroups = temp;
        this._partnerGroupsService.partnerGroups = this.partnerGroups;
        console.log(group);
    }

    toggleGroup(group:PartnerGroup) {
        var primaryUnselected:boolean = false;
        var secondaryUnselected:boolean = false;
        var tertiaryUnselected:boolean = false;
        for(var partnerGroup of this.partnerGroups) {
            primaryUnselected = false;
            if(partnerGroup.network_id === group.network_id) {
                partnerGroup.selected = !partnerGroup.selected;
                if(!partnerGroup.selected) {
                    primaryUnselected = true;
                }
            }
            if(partnerGroup.secondary_network) {
                for(var secondaryGroup of partnerGroup.secondary_network) {
                    secondaryUnselected = false;
                    if(secondaryGroup.network_id === group.network_id) {
                        secondaryGroup.selected = !secondaryGroup.selected;
                        if(!secondaryGroup.selected) {
                            secondaryUnselected = true;
                        }
                    }
                    if(partnerGroup.selected) {
                        secondaryGroup.selected = true;
                    }
                    else if(primaryUnselected) {
                        secondaryGroup.selected = false;
                    }
                    if(secondaryGroup.tertiary_network) {
                        tertiaryUnselected = false;
                        for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                            if(tertiaryGroup.network_id === group.network_id) {
                                tertiaryGroup.selected = !tertiaryGroup.selected;
                                if(!tertiaryGroup.selected) {
                                    tertiaryUnselected = true;
                                }
                            }
                            if(secondaryGroup.selected) {
                                tertiaryGroup.selected = true;
                            }
                            else if(primaryUnselected || secondaryUnselected) {
                                tertiaryGroup.selected = false;
                            }
                            if(tertiaryGroup.quaternary_network) {
                                for (var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                    if(quaternaryGroup.network_id === group.network_id) {
                                        quaternaryGroup.selected = !quaternaryGroup.selected;
                                    }
                                    if(tertiaryGroup.selected) {
                                        quaternaryGroup.selected = true;
                                    }
                                    else if(primaryUnselected || secondaryUnselected || tertiaryUnselected) {
                                        quaternaryGroup.selected = false;
                                    }
                                }
                            }
                        }
                    }
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
        return group.hasOwnProperty('secondary_network') || group.hasOwnProperty('tertiary_network') || group.hasOwnProperty('quaternary_network')
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
                if(partnerGroup.secondary_network)
                    for(var secondaryGroup of partnerGroup.secondary_network) {
                        secondaryGroup.collapsed = collapsed;
                        if(secondaryGroup.tertiary_network)
                            for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                                tertiaryGroup.collapsed = collapsed;
                                if(tertiaryGroup.quaternary_network)
                                    for(var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                        quaternaryGroup.collapsed = collapsed;
                                    }
                            }
                    }
            }
    }

    toggle(group:PartnerGroup) {
        group.collapsed = !group.collapsed;

        if(this.partnerGroups)
            for(var partnerGroup of this.partnerGroups) {
                if(partnerGroup.network_id === group.network_id)
                    partnerGroup.collapsed = group.collapsed;
                if(partnerGroup.secondary_network)
                    for(var secondaryGroup of partnerGroup.secondary_network) {
                        if(secondaryGroup.network_id === group.network_id)
                            secondaryGroup.collapsed = group.collapsed;
                        if(secondaryGroup.tertiary_network)
                            for (var tertiaryGroup of secondaryGroup.tertiary_network) {
                                if(tertiaryGroup.network_id === group.network_id)
                                    tertiaryGroup.collapsed = group.collapsed;
                                if(tertiaryGroup.quaternary_network)
                                    for(var quaternaryGroup of tertiaryGroup.quaternary_network) {
                                        if(quaternaryGroup.network_id === group.network_id)
                                            quaternaryGroup.collapsed = group.collapsed;
                                    }
                            }
                    }
            }
    }
    
    submitPartnerGroups() {
        this._npnPortalService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
        this._partnerGroupsService.partnerGroups = JSON.parse(JSON.stringify(this.partnerGroups));
        this._npnPortalService.setObservationCount();
    }

    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        this.submitPartnerGroups();
        this._npnPortalService.activePage = next.routeName;
        return true;
    }

    ngOnInit() {
        this.partnerGroups = this._partnerGroupsService.partnerGroups;
        this.setAllCollapsed('');
        //this is called when removing a group from the view filters page
        this._partnerGroupsService.groupRemoved$.subscribe(group => {this.removeGroup(group); this.submitPartnerGroups();});
        this._partnerGroupsService.submitGroups$.subscribe(() => this.submitPartnerGroups());
    }
}
