import {Pipe} from "@angular/core";

export function isDatasheetAvailable(name: string, reportType: string): boolean {
    return !(name === "Observers" && reportType === "Status and Intensity")
        && !(name === "Observers" && reportType === "Site Phenometrics")
        && !(name === "Observers" && reportType === "Individual Phenometrics")
        && !(name === "Individual Plants" && reportType === "Site Phenometrics")
        && !(name === "Observation Details" && reportType != "Status and Intensity")
        && !(name === "Site Visit Details" && reportType != "Status and Intensity")

        && !(name === "Site Visit Details" && reportType === "Magnitude Phenometrics")
        && !(name === "Observers" && reportType === "Magnitude Phenometrics")
        && !(name === "Individual Plants" && reportType === "Magnitude Phenometrics")
        && !(name === "Sites" && reportType === "Magnitude Phenometrics");
}

@Pipe({
    name: 'available'
})
export class AvailabilityPipe {
    transform(value, reportType) {
        return value.filter((datasheet) => isDatasheetAvailable(datasheet.name, reportType));
    }
}
