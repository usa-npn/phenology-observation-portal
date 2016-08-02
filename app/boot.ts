import {bootstrap}        from '@angular/platform-browser-dynamic';
import {AppComponent}     from './app.component';
import {appRouterProviders} from './app.routes';
import {DeactivateGuard} from "./deactivate.guard";
import {ActivateGuard} from "./activate.guard";
import {NpnPortalService} from "./npn-portal.service";
import {HTTP_PROVIDERS} from "@angular/http";
import {Config} from "./config.service";
import {DeactivateDateRangeGuard} from "./date-range/deactivate-date-range.gaurd";

bootstrap(AppComponent, [
    HTTP_PROVIDERS, 
    appRouterProviders, 
    Config, 
    NpnPortalService, 
    DeactivateGuard, 
    ActivateGuard, 
    DeactivateDateRangeGuard
]);
