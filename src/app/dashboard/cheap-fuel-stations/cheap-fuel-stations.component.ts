import { Component } from '@angular/core';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import { FuelStation, Prices } from './cheap-fuel-stations.models';
import { Observable, Subscription, tap } from 'rxjs';
import { MapService } from '../../shared/components/map/map.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cheap-fuel-stations.component.html',
})
export class CheapFuelStationsComponent {
  private _appendGasStationsToMap = (fuelStations: FuelStation[]) => {
    fuelStations.forEach((fuelStation: FuelStation) => {
      const circle = this._mapService.appendFuelStationToMap(fuelStation);
      circle.bindPopup(`${fuelStation.prices[0]}`);
    });
  };

  foundFuelStation$ = this._mapService.foundedGasStation$;
  cheapFuelStations$: Observable<FuelStation[]> = this._cheapFuelStationService
    .getCheapFuelStations()
    .pipe(tap(this._appendGasStationsToMap.bind(this)));

  findGoogleImage(latitude: number, longitude: number): string {
    return `http://maps.google.com/maps/api/staticmap?center="${latitude},${longitude}"&zoom=15&size=300x150&sensor=false&key=AIzaSyBXkn_iiij3dPDUhyarJPe6qVVn2MGOY8I`;
  }

  convertFuelStationPrices(prices: Prices[]) {
    console.log(prices);
  }

  constructor(
    private _cheapFuelStationService: CheapFuelStationsService,
    private _mapService: MapService
  ) {}

  cheapFuelStationsCalled!: Subscription;

  ngOnInit() {
    this.cheapFuelStationsCalled = this.cheapFuelStations$.subscribe();
  }

  ngOnDestroy() {
    this.cheapFuelStationsCalled.unsubscribe();
    this._mapService.clearMapLayers;
  }
}
