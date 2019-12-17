import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Injectable} from "@angular/core";

@Injectable()
export class DeactivateGuard implements CanDeactivate<any> {

    canDeactivate(target: any, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('target');
        console.log(target);
        console.log('route');
        console.log(route);
        console.log('state');
        console.log(state);
        target.submit();
        // target._npnPortalService.activePage = state.url;
        return true;
    }
}