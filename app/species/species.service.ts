 import {Injectable, EventEmitter} from '@angular/core';
 import {SpeciesType} from './species-type';
 import {Http, Response, Headers} from '@angular/http';
 import {Observable} from 'rxjs/Observable';
 import {FunctionalType} from './functional-type';
 import {Species} from './species';
 import {Config} from '../config.service'

 @Injectable()
 export class SpeciesService {
     
     constructor (private http: Http, private config: Config) {}
     
     private _speciesUrl = this.config.getNpnPortalUrl() + '/npn_portal/species/getSpecies.json';
     private _functionalTypesUrl = this.config.getNpnPortalUrl() + '/npn_portal/species/getSpeciesFunctionalTypes.json';
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
             species_type_id: 29,
             network_id: 1,
             species_type: 'Calibration',
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
             species_type_id: 31,
             network_id: 1,
             species_type: 'Green Wave Campaign',
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
         }];


     initSpecies() {
         this.getSpecies().subscribe(
             species => {console.log('species have been set'); this.species = species; this.ready = true;},
             error => this.errorMessage = <any>error)
     }

     getSpecies() {
         return this.http.get(this._speciesUrl)
             .map(res => <Species[]> res.json())
             .catch(this.handleError);
     }

     initFunctionalTypes() {
         this.getFunctionalTypes().subscribe(
             functionalTypes => {this.functionalTypes = functionalTypes; console.log('functional types have been set');},
             error => this.errorMessage = <any>error)
     }

     getFunctionalTypes() {
         return this.http.get(this._functionalTypesUrl)
             .map(res => <FunctionalType[]> res.json())
             .catch(this.handleError);
     }

    private handleError (error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
     
     public reset () {
         for (var s of this.species) {
             s.selected = false;
         }
     }
}
