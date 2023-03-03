import {Injectable} from '@angular/core';

@Injectable()
export class Config {

    public getPopServerUrl() {
        // if(location.hostname.includes('local')){
        //     return location.protocol + '//' + location.hostname;
        // }
        if(location.hostname.includes('staging')){
            return "https://services-staging.usanpn.org/pop-services";
        }else{
            return "https://services-staging.usanpn.org/pop-services";
        }
    }

    public getNpnPortalServerUrl() {
        // if(location.hostname.includes('local')){
        //     return location.protocol + '//' + location.hostname;
        // }
        
        if(location.hostname.includes('staging')){
            return "https://services-staging.usanpn.org";
        }else{
            return "https://services-staging.usanpn.org";
        }
    }

    public getWebServicesUrl() {
        if(location.hostname.includes('staging')){
            return "https://services-staging.usanpn.org/web-services";
        }else{
            return "https://services-staging.usanpn.org/web-services";
        }
    }

    public getPopUrl() {
        // if(location.hostname.includes('local')){
        //     return window.location.origin;
        // }
        
        if(location.hostname.includes('staging')){
            return window.location.origin + "/observations";
        }else{
            return window.location.origin + "/observations";
        }
    }
    
    public getPopDownloadEndpoint() {
        return '/download';
    }

    public getPopDownloadStatusEndpoint() {
        return '/downloadstatus';
    }
    
    public getPopSearchEndpoint() {
        return '/search';
    }

    public getPopFgdcEndpoint() {
        return '/fgdc';
    }
}
