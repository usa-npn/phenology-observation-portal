import {Pipe} from "@angular/core";

@Pipe({
    name: 'available'
})
export class AvailabilityPipe {
    transform(value, reportType) {
        return value.filter((datasheet) => !(datasheet.name === "Observers" && reportType === "Site-Level Summarized")
                                        && !(datasheet.name === "Individual Plants" && reportType === "Site-Level Summarized")
                                        && !(datasheet.name === "Observation Details" && reportType != "Raw"));
    }
}