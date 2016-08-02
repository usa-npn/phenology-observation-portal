import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {NpnPortalService} from "../npn-portal.service";

@Component({
    templateUrl: 'app/help/help.html',
    styleUrls: ['app/help/help.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class HelpComponent {
    constructor(private _npnPortalService: NpnPortalService) {}
}
