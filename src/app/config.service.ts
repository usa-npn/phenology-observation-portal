import {Injectable} from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { environment } from '../environments/environment';

@Injectable()
export class Config {

    constructor(private _locationStrategy: LocationStrategy) {}

    public getNpnPortalServerUrl() {
        // if(location.hostname.includes('local')){
        //     return location.protocol + '//' + location.hostname;
        // }
        
        if(location.hostname.includes('staging')){
            return "https://services-staging.usanpn.org";
        }else{
            return "https://services.usanpn.org";
        }
    }

    public getWebServicesUrl() {
        if(location.hostname.includes('staging')){
            return "https://services-staging.usanpn.org/web-services";
        }else{
            return "https://services.usanpn.org/web-services";
        }
    }

    // POP's own front-end root, used to build shareable ?search= links. This has to be wherever
    // this build is actually served from, which is exactly its <base href> (set by --base-href at
    // build time, or APP_BASE_HREF). The old hardcoded "/observations" produced a dead link
    // anywhere else - under ng serve, and after the base href moved to "/".
    public getPopUrl() {
        return window.location.origin + this._locationStrategy.getBaseHref();
    }

    public getLambdaEndpoint() {
        return environment.CREATE_REQUEST_URL;
    }

    public getStatusEndpoint() {
        return environment.STATUS_REQUEST_URL;
    }

    public getObservationCountUrl() {
        return environment.OBSERVATION_COUNT_URL;
    }

    public getTokenUrl() {
        return environment.TOKEN_URL;
    }

    // No trailing slash - getSearch() appends '/{hash}'.
    public getSavedSearchUrl() {
        return environment.SAVED_SEARCH_URL;
    }

}
