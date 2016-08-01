import {Injectable} from '@angular/core';

@Injectable()
export class Config {
    public getNpnPortalUrl() {
        if(location.hostname.includes('local'))
            return location.protocol + '//' + location.hostname;
        if(location.hostname.includes('dev'))
            return location.protocol + "//www-dev.usanpn.org";
        else
            return location.protocol + "//www.usanpn.org";
    }
}
