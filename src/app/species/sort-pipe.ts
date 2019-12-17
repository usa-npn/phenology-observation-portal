import {Pipe} from "@angular/core";

@Pipe({
    name: 'sort'
})
export class SortPipe {
    transform(value, sortField) {
        if (sortField == 'species_type') {
            value = value.sort(function(a, b) {
                return a.species_type.localeCompare(b.species_type);
            });
        }
        if (sortField == 'functional_type') {
            value = value.sort(function(a, b) {
                return a.type_name.localeCompare(b.type_name);
            });
        }
        return value;
    }
}