import {Component} from "@angular/core";
import {Config} from '../config.service';

@Component({
    templateUrl: 'metadata.html',
    styleUrls: ['metadata.component.css']
})

export class MetadataComponent {
    constructor(private config: Config) {}
    
    downloadFile(fileLocation) {
        window.location.replace('https://www.usanpn.org' + fileLocation);
    }

    fgdcLink = this.config.getPopServerUrl() + this.config.getPopFgdcEndpoint();
}
