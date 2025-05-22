import {Component, OnInit, OnDestroy} from '@angular/core';
import {
  FuelStationSummary,
  SoortFuelType,
} from './cheap-fuel-stations.models';
import {CheapFuelStationsService} from './cheap-fuel-stations.service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {MapService} from '../../map/map.service';
import {CommonModule} from '@angular/common';
import {NgxLoadingModule} from 'ngx-loading';
import {ActivatedRoute, Params} from '@angular/router';
import {NotifierService} from 'angular-notifier';
import {DetailsComponent} from './details/details.component';
import {DEFAULT_LOADING_SETTINGS} from "../../app.contants";

@Component({
  selector: 'app-cheap-fuel-stations',
  standalone: true,
  templateUrl: './cheap-fuel-stations.component.html',
  imports: [CommonModule, NgxLoadingModule, DetailsComponent],
})
export class CheapFuelStationsComponent implements OnInit, OnDestroy {
  private readonly _isLoading$ = new BehaviorSubject(true);
  public readonly isLoading$ = this._isLoading$.asObservable();

  public readonly foundGasStationId$ = this._mapService.foundGasStationId$;
  public readonly theme$ = this._mapService.theme$;

  constructor(
    private readonly _cheapFuelStationService: CheapFuelStationsService,
    private readonly _mapService: MapService,
    private readonly _route: ActivatedRoute,
    private readonly _notifierService: NotifierService
  ) {
  }

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
    this._mapService.cleanupObservables();
  }

  private _fuelTypeToCode = new Map<string, SoortFuelType>([
    ['lpg', 'autogas'],
    ['cng', 'cng'],
    ['diesel', 'diesel'],
    ['premium_diesel', 'diesel_special'],
    ['euro98', 'euro98'],
    ['euro95', 'euro95'],
  ]);

  private _calculatePriceIndication(fuelStations: FuelStationSummary[]): FuelStationSummary[] {
    const highestCosts = Math.max(...fuelStations.map((station) => station.price));
    const lowestCosts = Math.min(...fuelStations.map((station) => station.price));

    return fuelStations.map((station: FuelStationSummary) => ({
      ...station,
      price_indication: Math.floor(((station.price - lowestCosts) / (highestCosts - lowestCosts)) * 100),
    }));
  }

  protected readonly DEFAULT_LOADING_SETTINGS = DEFAULT_LOADING_SETTINGS;
}
