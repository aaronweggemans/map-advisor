import { Component, OnInit } from '@angular/core';
import { FuelStation } from './cheap-fuel-stations.models';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import { map, Subscription, tap } from 'rxjs';
import { MapService } from '../../shared/components/map/map.service';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  templateUrl: './cheap-fuel-stations.component.html',
  imports: [CommonModule, BarChartComponent, NgxLoadingModule],
})
export class CheapFuelStationsComponent implements OnInit {
  public loading: boolean = true;
  private _appendGasStationsToMap = (fuelStations: FuelStation[]) => {
    fuelStations.forEach((fuelStation: FuelStation) => {
      const circle = this._mapService.appendFuelStationToMap(fuelStation);
      circle.bindPopup(`${fuelStation.prices[0]}`);
    });
  };

  foundFuelStation$ = this._mapService.foundedGasStation$.pipe(
    tap((d) => console.log(d)),
    map((fuelStation) => ({
      ...fuelStation,
      barChartData: {
        labels: fuelStation.prices.map((prices) => prices.fueltype),
        data: fuelStation.prices.map((prices) => prices.price.toString()),
      },
    }))
  );

  findGoogleImage(latitude: number, longitude: number): string {
    return `http://maps.google.com/maps/api/staticmap?center="${latitude},${longitude}"&zoom=15&size=300x150&sensor=false&key=AIzaSyBXkn_iiij3dPDUhyarJPe6qVVn2MGOY8I`;
  }

  constructor(
    private _cheapFuelStationService: CheapFuelStationsService,
    private _mapService: MapService
  ) {}

  cheapFuelStationsCalled!: Subscription;

  ngOnInit() {
    this.cheapFuelStationsCalled = this._cheapFuelStationService
      .getCheapFuelStations()
      .pipe(tap(this._appendGasStationsToMap.bind(this)))
      .subscribe({
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngOnDestroy() {
    console.log('clearing');

    this.cheapFuelStationsCalled.unsubscribe();
    this._mapService.clearMapLayers;
  }
}
