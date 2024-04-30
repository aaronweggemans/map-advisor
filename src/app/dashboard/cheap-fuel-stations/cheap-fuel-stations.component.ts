import { Component } from '@angular/core';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import { FuelStation } from './cheap-fuel-stations.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  imports: [],
  templateUrl: './cheap-fuel-stations.component.html',
})
export class CheapFuelStationsComponent {
  cheapFuelStations$: Observable<FuelStation> =
    this._cheapFuelStationService.getCheapFuelStations();

  constructor(private _cheapFuelStationService: CheapFuelStationsService) {}
}
