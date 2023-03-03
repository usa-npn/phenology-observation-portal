 import {Injectable, EventEmitter} from '@angular/core';
 import {SpeciesType} from './species-type';
 import { HttpClient } from '@angular/common/http';
 import {FunctionalType} from './functional-type';
 import {Species} from './species';
 import {Config} from '../config.service'
 import {PersistentSearchService} from "../persistent-search.service";
 import {NpnPortalService} from "../npn-portal.service";

 @Injectable()
 export class SpeciesService {
     
     constructor (private http: HttpClient, 
                  private config: Config, 
                  private _persistentSearchService: PersistentSearchService, 
                  private _npnPortalService: NpnPortalService) {}
     
     private _speciesUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/species/getSpecies.json';
     private _functionalTypesUrl = this.config.getNpnPortalServerUrl() + '/npn_portal/species/getSpeciesFunctionalTypes.json';
     errorMessage: string;

     public speciesRemoved$ = new EventEmitter();
     public submitSpecies$ = new EventEmitter();

     public removeSpecies(species:Species): void {
         this.speciesRemoved$.emit(species);
     }

     public submitSpecies(): void {
         this.submitSpecies$.emit({});
     }

     public ready:boolean = false;
     public species:Species[] = [];
     public functionalTypes:FunctionalType[] = [];
    public speciesTypes:SpeciesType[] = [{
         species_type_id: 1,
         network_id: 1,
         species_type: 'Allergen',
         comment: '',
         user_display: 5,
         kingdom: 'Plantae',
         image_path: ''
     },
         {
             species_type_id: 7,
             network_id: 1,
             species_type: 'Aquatic',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
             species_type_id: 10,
             network_id: 1,
             species_type: 'Cloned',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
             species_type_id: 6,
             network_id: 1,
             species_type: 'Crop',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
            species_type_id: 35,
            network_id: 1,
            species_type: 'Flowers for Bats Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
         },
         {
             species_type_id: 31,
             network_id: 1,
             species_type: 'Green Wave Campaign',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
            species_type_id: 28,
            network_id: 1,
            species_type: 'Invasive Animals',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
         {
             species_type_id: 4,
             network_id: 1,
             species_type: 'Invasive Plants',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
             species_type_id: 1,
             network_id: 1,
             species_type: 'Ornamental',
             comment: '',
             user_display: 1,
             kingdom: 'Plantae',
             image_path: ''
         },
         {
            species_type_id: 41,
            network_id: 1,
            species_type: 'Pesky Plant Trackers Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
        {
            species_type_id: 38,
            network_id: 1,
            species_type: 'Pest Patrol Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
        {
            species_type_id: 34,
            network_id: 1,
            species_type: 'Nectar Connectors Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
        {
            species_type_id: 32,
            network_id: 1,
            species_type: 'Shady Invaders Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
        {
            species_type_id: 33,
            network_id: 1,
            species_type: 'Southwest Season Trackers Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        },
        {
            species_type_id: 43,
            network_id: 1,
            species_type: 'Quercus Quest Campaign',
            comment: '',
            user_display: 1,
            kingdom: 'Plantae',
            image_path: ''
        }
    ];


     initSpecies() {
         this.getSpecies().subscribe(
             species => {
                 console.log('species have been set');
                 this.species = species;
                 let speciesIds = this._persistentSearchService.species;
                 if(speciesIds) {
                     for(var speciesId of speciesIds) {
                         for(var sp of this.species) {
                             if(sp.species_id === speciesId)
                                 sp.selected = true;
                         }
                     }
                     this._npnPortalService.species = this.species.map(obj => Object.assign({}, obj));
                 }
                 this.ready = true;
             },
             error => this.errorMessage = <any>error)
     }

     getSpecies() {
         return this.http.get<Species[]>(this._speciesUrl);
     }

     initFunctionalTypes() {
         this.getFunctionalTypes().subscribe(
             functionalTypes => {this.functionalTypes = functionalTypes; console.log('functional types have been set');},
             error => this.errorMessage = <any>error)
     }

     getFunctionalTypes() {
         return this.http.get<FunctionalType[]>(this._functionalTypesUrl);
     }
     
     public reset () {
         for (var s of this.species) {
             s.selected = false;
         }
     }
}
