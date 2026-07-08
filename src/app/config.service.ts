import {Injectable} from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class Config {

    public getPopServerUrl() {
        return environment.POP_SERVER_URL;
    }

    public getNpnPortalServerUrl() {
        return environment.NPN_PORTAL_SERVER_URL;
    }

    public getPopUrl() {
        return window.location.origin + "/observations";
    }

    public getPopDownloadEndpoint() {
        return '/popservices/pop/download';
    }

    public getPopDownloadStatusEndpoint() {
        return '/popservices/pop/downloadstatus';
    }

    public getPopSearchEndpoint() {
        return '/popservices/pop/search';
    }

    public getPopFgdcEndpoint() {
        return '/popservices/pop/fgdc';
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

}
