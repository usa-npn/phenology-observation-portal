import {Injectable} from '@angular/core';

@Injectable()
export class Config {

    public getPopServerUrl() {
        if(location.hostname.includes('local')){
            return location.protocol + '//' + location.hostname;
        }
        
        if(location.hostname.includes('dev')){
            return "https://data-dev.usanpn.org";
        }else{
            return "https://data.usanpn.org";
        }
    }

    public getNpnPortalServerUrl() {
        if(location.hostname.includes('local')){
            return location.protocol + '//' + location.hostname;
        }
        
        if(location.hostname.includes('dev')){
            return "https://www-dev.usanpn.org";
        }else{
            return "https://www.usanpn.org";
        }
    }

    public getPopUrl() {
        if(location.hostname.includes('local')){
            return window.location.origin;
        }
        
        if(location.hostname.includes('dev')){
            return window.location.origin + "/observations";
        }else{
            return window.location.origin + "/observations";
        }
    }
    
    public getPopDownloadEndpoint() {
        return ':3002/pop/download';
    }
    
    public getPopSearchEndpoint() {
        return ':3002/pop/search';
    }

    public getPopFgdcEndpoint() {
        return ':3002/pop/fgdc';
    }
}
