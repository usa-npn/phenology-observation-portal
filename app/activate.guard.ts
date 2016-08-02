import { Injectable }     from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot}    from '@angular/router';
import {NpnPortalService} from "./npn-portal.service";

@Injectable()
export class ActivateGuard implements CanActivate {

    constructor (private _npnPortalService: NpnPortalService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('can activate');
        console.log(route);
        console.log(route.url[0].path);
        this._npnPortalService.activePage = route.url[0].path;
        return true;
    }
}