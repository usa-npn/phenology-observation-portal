import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'speciessearchpipe'
})
export class SpeciesSearchPipe implements PipeTransform {
    transform(value, speciesName, sortType, sortReverse, functionalType, speciesType) {
        
        speciesName = speciesName.toString().toLowerCase();
        if(sortType === "common") {
            value = value.sort(function(a, b) {
                if(sortReverse)
                    return b.common_name.localeCompare(a.common_name);
                else
                    return a.common_name.localeCompare(b.common_name);
            });
        }
        else if(sortType === "scientific") {
            value = value.sort(function(a, b) {
                if(sortReverse)
                    return b.genus.localeCompare(a.genus);
                else
                    return a.genus.localeCompare(b.genus);
            });
        }

        if ( functionalType && functionalType != 'All') {
            value = value.filter((species)=> species.functional_type.toLowerCase().includes(functionalType.toLowerCase()));
        }

        if ( speciesType && speciesType != 'All') {
            value = value.filter(function(species) {
                var found = false;
                species.species_type.forEach(function(sp_type) {
                    if (sp_type.Species_Type && sp_type.Species_Type.toLowerCase().includes(speciesType.toLowerCase())) {
                        found = true;
                        return;
                    }
                });
                return found;
            });
        }

        return value.filter((species)=> species.common_name.toLowerCase().includes(speciesName)
            || species.genus.toLowerCase().includes(speciesName)
            || species.species.toLowerCase().includes(speciesName));
    }
}