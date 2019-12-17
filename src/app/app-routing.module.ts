import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GetStartedComponent } from './get-started/get-started.component';
import { DateRangeComponent } from './date-range/date-range.component';
import { LocationsComponent } from './locations/locations.component';
import { SpeciesComponent } from './species/species.component';
import { PhenophasesComponent } from './phenophases/phenophases.component';
import { PartnerGroupsComponent } from './partner-groups/partner-groups.component';
import { IntegratedDatasetsComponent } from './integrated-datasets/integrated-datasets.component';
import { OutputFieldsComponent } from './output-fields/output-fields.component';
import { AncillaryDataComponent } from './ancillary-data/ancillary-data.component';
import { MetadataComponent } from './metadata/metadata.component';
import { HelpComponent } from './help/help.component';
import { ActivateGuard } from './activate.guard';
import { DeactivateDateRangeGuard } from './date-range/deactivate-date-range.gaurd';
import { DeactivateGuard } from './deactivate.guard';

const routes: Routes = [
    {
        path: '', redirectTo: 'get-started', 
        pathMatch: 'full'
    },
    {
        path: 'get-started', 
        component: GetStartedComponent, 
        canActivate: [ActivateGuard]
    },
    {
        path: 'date-range', 
        component: DateRangeComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateDateRangeGuard]
    },
    {
        path: 'locations', 
        component: LocationsComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'species', 
        component: SpeciesComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'phenophases', 
        component: PhenophasesComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'partner-groups', 
        component: PartnerGroupsComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'integrated-datasets', 
        component: IntegratedDatasetsComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'output-fields', 
        component: OutputFieldsComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'ancillary-data',
        component: AncillaryDataComponent,
        canActivate: [ActivateGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'metadata', 
        component: MetadataComponent
    },
    {
        path: 'help', 
        component: HelpComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// import { provideRouter, RouterConfig }  from '@angular/router';
// import {GetStartedComponent} from "./get-started/get-started.component";
// import {DateRangeComponent} from "./date-range/date-range.component";
// import {LocationsComponent} from "./locations/locations.component";
// import {SpeciesComponent} from "./species/species.component";
// import {PhenophasesComponent} from "./phenophases/phenophases.component";
// import {PartnerGroupsComponent} from "./partner-groups/partner-groups.component";
// import {IntegratedDatasetsComponent} from "./integrated-datasets/integrated-datasets.component";
// import {OutputFieldsComponent} from "./output-fields/output-fields.component";
// import {AncillaryDataComponent} from "./ancillary-data/ancillary-data.component";
// import {MetadataComponent} from "./metadata/metadata.component";
// import {HelpComponent} from "./help/help.component";
// import {DeactivateGuard} from "./deactivate.guard";
// import {ActivateGuard} from "./activate.guard";
// import {DeactivateDateRangeGuard} from "./date-range/deactivate-date-range.gaurd";

// const routes: RouterConfig = [
//     {
//         path: '', redirectTo: 'get-started', 
//         pathMatch: 'full'
//     },
//     {
//         path: 'get-started', 
//         component: GetStartedComponent, 
//         canActivate: [ActivateGuard]
//     },
//     {
//         path: 'date-range', 
//         component: DateRangeComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateDateRangeGuard]
//     },
//     {
//         path: 'locations', 
//         component: LocationsComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'species', 
//         component: SpeciesComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'phenophases', 
//         component: PhenophasesComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'partner-groups', 
//         component: PartnerGroupsComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'integrated-datasets', 
//         component: IntegratedDatasetsComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'output-fields', 
//         component: OutputFieldsComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'ancillary-data',
//         component: AncillaryDataComponent,
//         canActivate: [ActivateGuard],
//         canDeactivate: [DeactivateGuard]
//     },
//     {
//         path: 'metadata', 
//         component: MetadataComponent
//     },
//     {
//         path: 'help', 
//         component: HelpComponent
//     }
// ];

// export const appRouterProviders = [
//     provideRouter(routes)
// ];