import {Component} from "@angular/core";
import {NpnPortalService} from "../npn-portal.service";

@Component({
    templateUrl: 'help.html',
    styleUrls: ['help.component.css']
})
export class HelpComponent {
    constructor(private _npnPortalService: NpnPortalService) {}
}
