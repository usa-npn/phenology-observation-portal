import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {Config} from '../config.service';
import {Http} from "@angular/http";

@Component({
    templateUrl: 'app/metadata/metadata.html',
    styleUrls: ['app/metadata/metadata.component.css'],
    directives: [ROUTER_DIRECTIVES]
})

export class MetadataComponent {
    constructor(private config: Config) {}
    
    downloadFile(fileLocation) {
        window.location.replace(this.config.getNpnPortalServerUrl() + fileLocation);
    }

    fgdcLink = this.config.getPopServerUrl() + this.config.getPopFgdcEndpoint();
}
