import { Routes } from '@angular/router';
import { CheapFuelStationsComponent } from './dashboard/cheap-fuel-stations/cheap-fuel-stations.component';
import { DashboardStatisticsComponent } from './dashboard/dashboard-statistics/dashboard-statistics.component';
import {CalculateRouteComponent} from "./dashboard/calculate-route/calculate-route.component";

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardStatisticsComponent,
  },
  {
    path: 'cheap-fuel-stations/:fueltype',
    component: CheapFuelStationsComponent,
  },
  {
    path: 'calculate-route-for-cheap-fuel-stations',
    component: CalculateRouteComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
