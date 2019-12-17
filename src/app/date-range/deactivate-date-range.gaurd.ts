import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {DateRangeComponent} from "./date-range.component";
import {NpnPortalService} from "../npn-portal.service";
import {Injectable} from "@angular/core";

@Injectable()
export class DeactivateDateRangeGuard implements CanDeactivate<DateRangeComponent> {

    constructor (private _npnPortalService: NpnPortalService) {}

    canDeactivate(target: DateRangeComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(this._npnPortalService.resettingFilters) {
            return true;
        }
        if(target.getDownloadType() === 'raw' && !target.rawDateForm.controls.startDate.value && !target.rawDateForm.controls.endDate.value) {
            return true;
        }
        else if (!target.isDateRangeValid())
            return false;
        else {
            target.submit();
            return true;
        }
    }
}