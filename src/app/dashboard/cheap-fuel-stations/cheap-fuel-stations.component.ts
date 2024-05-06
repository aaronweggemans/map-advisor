import { Component, OnInit } from '@angular/core';
import {
  FuelStation,
  Prices,
  SoortFuelType,
} from './cheap-fuel-stations.models';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import { catchError, map, Subscription, switchMap, tap } from 'rxjs';
import { MapService } from '../../shared/components/map/map.service';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { NgxLoadingModule } from 'ngx-loading';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  templateUrl: './cheap-fuel-stations.component.html',
  imports: [CommonModule, BarChartComponent, NgxLoadingModule],
})
export class CheapFuelStationsComponent implements OnInit {
  public loading: boolean = true;
  private _initialCall: boolean = true;

  private _appendGasStationsToMap = (fuelStations: FuelStation[]) => {
    fuelStations.forEach((fuelStation: FuelStation) => {
      const circle = this._mapService.appendFuelStationToMap(fuelStation);
      circle.bindPopup(`${fuelStation.price_indication}`);
    });
  };

  foundFuelStation$ = this._mapService.foundedGasStation$.pipe(
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
    private _mapService: MapService,
    private _route: ActivatedRoute
  ) {}

  cheapFuelStationsCalled!: Subscription;

  ngOnInit() {
    this.cheapFuelStationsCalled = this._route.params
      .pipe(
        tap(() => {
          this.loading = true;
          if (!this._initialCall) this._mapService.clearMapLayers();
        }),
        map((params: Params) => params['fueltype']),
        map((fuelType: string) => this._fuelTypeToCode.get(fuelType)!),
        switchMap((fuelType: SoortFuelType) => {
          return this._cheapFuelStationService.getCheapFuelStations().pipe(
            map((fuelStations) =>
              this._calculatePriceIndication(fuelStations, fuelType)
            ),
            tap(this._appendGasStationsToMap.bind(this))
          );
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this._initialCall = false;
        },
      });
  }

  private _fuelTypeToCode = new Map<string, SoortFuelType>([
    ['lpg', 'autogas'],
    ['cng', 'cng'],
    ['diesel', 'diesel'],
    ['premium_diesel', 'diesel_special'],
    ['euro98', 'euro98'],
    ['euro95', 'euro95'],
  ]);

  ngOnDestroy() {
    this.cheapFuelStationsCalled.unsubscribe();
    this._mapService.clearMapLayers();
  }

  private _calculatePriceIndication(
    fuelStations: FuelStation[],
    fuelType: string
  ): FuelStation[] {
    const stations = fuelStations.filter((fuelStation) =>
      fuelStation.prices.find((prices) => prices.fueltype === fuelType)
    );

    const highestCosts = Math.max.apply(
      Math,
      stations.map((station) => this._getPrice(station, fuelType))
    );
    const lowestCosts = Math.min.apply(
      Math,
      stations.map((station) => this._getPrice(station, fuelType))
    );

    return stations.map((station: FuelStation) => {
      const price = this._getPrice(station, fuelType);
      const price_indication = Math.floor(
        ((price - lowestCosts) / (highestCosts - lowestCosts)) * 100
      );

      return {
        ...station,
        price_indication,
      };
    });
  }

  private _getPrice(stations: FuelStation, fuelType: string) {
    return stations.prices.find(
      (prices: Prices) => prices.fueltype === fuelType
    )!.price;
  }
}
