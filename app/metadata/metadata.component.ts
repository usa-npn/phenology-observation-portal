import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";

@Component({
    templateUrl: 'app/metadata/metadata.html',
    styleUrls: ['app/metadata/metadata.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class MetadataComponent {
    constructor() {}
    
    downloadFile(fileLocation) {
        window.location.replace(window.location.origin + fileLocation);
    }
}
