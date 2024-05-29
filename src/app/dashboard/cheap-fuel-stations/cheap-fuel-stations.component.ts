import { Component, OnInit } from '@angular/core';
import {
  FuelStationSummary,
  SoortFuelType,
} from './cheap-fuel-stations.models';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { MapService } from '../../shared/components/map/map.service';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './details/bar-chart/bar-chart.component';
import { NgxLoadingModule } from 'ngx-loading';
import { ActivatedRoute, Params } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  templateUrl: './cheap-fuel-stations.component.html',
  imports: [CommonModule, NgxLoadingModule, DetailsComponent],
})
export class CheapFuelStationsComponent implements OnInit {
  private readonly _isLoading$ = new BehaviorSubject(true);
  public readonly isLoading$ = this._isLoading$.asObservable();

  private readonly _foundGasStationId$: Subject<number> = new Subject<number>();
  public readonly foundGasStationId$ = this._foundGasStationId$.asObservable();

  constructor(
    private _cheapFuelStationService: CheapFuelStationsService,
    private _mapService: MapService,
    private _route: ActivatedRoute,
    private _notifierService: NotifierService
  ) {}

  cheapFuelStationsCalled!: Subscription;

  ngOnInit() {
    this.cheapFuelStationsCalled = this._route.params
      .pipe(
        tap(() => {
          this._isLoading$.next(true);
          this._mapService.clearMapLayers();
        }),
        map((params: Params) => params['fueltype']),
        map((fuelType: string) => this._fuelTypeToCode.get(fuelType)!),
        switchMap((fuelType: SoortFuelType) => {
          return this._cheapFuelStationService.getFuelStations(fuelType).pipe(
            catchError((error) => {
              this._isLoading$.next(false);
              this._notifierService.show({
                type: 'error',
                message: `Something went wrong: ${error.statusText}`,
              });

              return EMPTY;
            }),
            map(this._calculatePriceIndication),
            tap(this._appendGasStationsToMap.bind(this))
          );
        })
      )
      .subscribe({
        next: () => {
          this._isLoading$.next(false);
        },
      });
  }

  ngOnDestroy() {
    this.cheapFuelStationsCalled.unsubscribe();
    this._mapService.clearMapLayers();
  }

  private _fuelTypeToCode = new Map<string, SoortFuelType>([
    ['lpg', 'autogas'],
    ['cng', 'cng'],
    ['diesel', 'diesel'],
    ['premium_diesel', 'diesel_special'],
    ['euro98', 'euro98'],
    ['euro95', 'euro95'],
  ]);

  private _appendGasStationsToMap = (fuelStations: FuelStationSummary[]) => {
    fuelStations.forEach((fuelStation: FuelStationSummary) => {
      const circle = this._mapService.appendFuelStationToMap(fuelStation);
      circle.on('click', () => {
        this._foundGasStationId$.next(fuelStation.id),
          this._mapService.flyTo(fuelStation.lat, fuelStation.lon);
      });
    });
  };

  private _calculatePriceIndication(
    fuelStations: FuelStationSummary[]
  ): FuelStationSummary[] {
    const highestCosts = Math.max.apply(
      Math,
      fuelStations.map((station) => station.price)
    );
    const lowestCosts = Math.min.apply(
      Math,
      fuelStations.map((station) => station.price)
    );

    return fuelStations.map((station: FuelStationSummary) => ({
      ...station,
      price_indication: Math.floor(
        ((station.price - lowestCosts) / (highestCosts - lowestCosts)) * 100
      ),
    }));
  }
}
