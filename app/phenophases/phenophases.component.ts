import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {Phenophase} from "./phenophase";
import {PhenophasePipe} from "./phenophase-pipe";
import {PhenophasesService} from "./phenophases.service";

@Component({
    pipes: [PhenophasePipe],
    templateUrl: 'app/phenophases/phenophases.html',
    styleUrls: ['app/phenophases/phenophases.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class PhenophasesComponent implements OnInit {
    constructor(private _npnPortalService: NpnPortalService,
                private _phenophasesService: PhenophasesService,
                private _router: Router) {}

    phenophases:Phenophase[] = this._npnPortalService.phenophases;

    togglePhenophase(phenophase) {
        phenophase.selected = !phenophase.selected;
    }
    
    removePhenophase(phenophase:Phenophase) {
        for(var ph of this.phenophases) {
           if(phenophase.phenophase_id === ph.phenophase_id) 
               ph.selected = false;
        }
    }

    submit() {
        this._npnPortalService.phenophases = this.phenophases.map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    // routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    //     this.submit();
    //     this._npnPortalService.activePage = next.routeName;
    //     return true;
    // }

    ngOnInit() {
        this.phenophases =  this._phenophasesService.phenophases;
        this._phenophasesService.phenophaseRemoved$.subscribe(phenophase => {this.removePhenophase(phenophase); this.submit()});
        this._phenophasesService.submitPhenophases$.subscribe(() => this.submit());
    }
}
