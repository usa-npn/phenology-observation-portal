import {Pipe} from "@angular/core";

@Pipe({
    name: 'category'
})
export class PhenophasePipe {
    transform(value, phenoCategory) {

        // prune to animal or plant
        if(phenoCategory === "plant") {
            value = value.filter((phenophase)=> phenophase.color && phenophase.color.toLowerCase().includes('green'));
        }
        else if(phenoCategory === "animal") {
            value = value.filter((phenophase)=> phenophase.color && phenophase.color.toLowerCase().includes('brown'));
        }

        // remove duplicates
        var seen = {};
        value = value.filter(function(item) {
            return seen.hasOwnProperty(item.phenophase_category) ? false : (seen[item.phenophase_category] = true);
        });

        // sort them
        return value.sort(function(a, b) {
            return a.phenophase_category.localeCompare(b.phenophase_category);
        });
    }
}