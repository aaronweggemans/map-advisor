import { Component } from '@angular/core';
import { MapComponent } from '../shared/components/map/map.component';
import { RouterOutlet } from '@angular/router';
import { CheapFuelStationsComponent } from './cheap-fuel-stations/cheap-fuel-stations.component';
import { NotifierModule } from 'angular-notifier';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, RouterOutlet, CheapFuelStationsComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
