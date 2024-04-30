import { Routes } from '@angular/router';
import { CheapFuelStationsComponent } from './dashboard/cheap-fuel-stations/cheap-fuel-stations.component';
import { DashboardStatisticsComponent } from './dashboard/dashboard-statistics/dashboard-statistics.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardStatisticsComponent,
  },
  {
    path: 'cheap-fuel-stations',
    component: CheapFuelStationsComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
