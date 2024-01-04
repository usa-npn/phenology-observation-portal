import {Pipe} from "@angular/core";

@Pipe({
    name: 'partnerGroupTagFilter',
})
export class PartnerGroupTagFilter {
    transform(partnerGroupsTags: any[]): any[] {
        if(partnerGroupsTags) {
            return partnerGroupsTags.filter(tag => {
                return tag.is_group === 1;
            });
        }
    }
}