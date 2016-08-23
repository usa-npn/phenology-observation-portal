import {Pipe} from "@angular/core";

@Pipe({
    name: 'available'
})
export class AvailabilityPipe {
    transform(value, reportType) {
        return value.filter((datasheet) => !(datasheet.name === "Observers" && reportType === "Site Phenometrics")
                                        && !(datasheet.name === "Individual Plants" && reportType === "Site Phenometrics")
                                        && !(datasheet.name === "Observation Details" && reportType != "Status and Intensity"));
    }
}