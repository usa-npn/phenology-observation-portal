import {Component, OnInit} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";
import {Species} from "./species";
import {FunctionalType} from "./functional-type";
import {SearchPipe} from "./search-pipe";
import {SortPipe} from "./sort-pipe";
import {SpeciesService} from "./species.service";
import {SpeciesType} from "./species-type";

@Component({
    pipes: [SearchPipe, SortPipe],
    templateUrl: 'app/species/species.html',
    styleUrls: ['app/species/species.component.css'],
    directives: [ROUTER_DIRECTIVES],
    providers: [SearchPipe]
})
export class SpeciesComponent implements OnInit {
    constructor(private _router: Router,
                private _npnPortalService: NpnPortalService,
                private _speciesService: SpeciesService,
                private _searchPipe: SearchPipe) {}

    species:Species[];
    functionalTypes:FunctionalType[];
    speciesTypes:SpeciesType[];
    
    nameFilter = "";
    speciesType = "All";
    functionalType = "All";
    sortType = "common";
    sortReverse = false;
    
    selectAll:boolean = false;

    filterChange() {
        this.selectAll = false;
    }
    
    toggleSpecies(species) {
        species.selected = !species.selected;
    }
    
    removeSpecies(species:Species) {
        for(var s of this.species) {
            if(species.species_id === s.species_id)
                s.selected = false;
        }
        this.selectAll = false;
    }

    toggleSelectAll() {
        this.selectAll = !this.selectAll;
        var filteredSpecies:Species[] = this._searchPipe.transform(this.species, this.nameFilter, this.sortType, this.sortReverse, this.functionalType, this.speciesType);
        for (var i = 0; i < filteredSpecies.length; i++) {
            if(this.selectAll)
                filteredSpecies[i].selected = true;
            else
                filteredSpecies[i].selected = false;
        }
    }

    submit() {
        this._npnPortalService.species = this.species.map(obj => Object.assign({}, obj));
        this._npnPortalService.setObservationCount();
    }

    onSelect(page) {
        this._router.navigate( [page] );
    }

    applySort(sortColumn) {
        if(this.sortType === sortColumn) {
            this.sortReverse = !this.sortReverse;
        }
        else
            this.sortReverse = false;
        this.sortType = sortColumn;
    }
    
    ngOnInit() {
        this.speciesTypes = this._speciesService.speciesTypes;
        this.functionalTypes =  this._speciesService.functionalTypes;
        this.species = this._speciesService.species;

        this._speciesService.speciesRemoved$.subscribe(species => {this.removeSpecies(species); this.submit()});
        this._speciesService.submitSpecies$.subscribe(() => this.submit());
    }
    
    // routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    //     this.submit();
    //     this._npnPortalService.activePage = next.routeName;
    //     return true;
    // }
}
