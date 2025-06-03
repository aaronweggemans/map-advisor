import { Routes } from '@angular/router';
import { EachMunicipalityComponent } from './dashboard/each-municipality/each-municipality.component';
import { DashboardStatisticsComponent } from './dashboard/dashboard-statistics/dashboard-statistics.component';
import {CalculateRouteComponent} from "./dashboard/calculate-route/calculate-route.component";

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardStatisticsComponent,
    data: { title: 'Dashboard' }
  },
  {
    path: 'vind-tankstation-in-gemeente',
    component: EachMunicipalityComponent,
    data: { title: 'Goedkoop tanken in uw buurt' }
  },
  {
    path: 'vind-tankstation-op-route',
    component: CalculateRouteComponent,
    data: { title: 'Bereken de route' }
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
