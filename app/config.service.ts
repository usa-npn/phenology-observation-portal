import {Injectable} from '@angular/core';

@Injectable()
export class Config {
    
    public getServerUrl() {
        if(location.hostname.includes('local'))
            return location.protocol + '//' + location.hostname;
        if(location.hostname.includes('dev'))
            return location.protocol + "//www-dev.usanpn.org";
        else
            return location.protocol + "//www.usanpn.org";
    }
    
    public getPopDownloadEndpoint() {
        return ':3002/pop/download';
    }
    
    public getPopSearchEndpoint() {
        return ':3002/pop/search';
    }
}
