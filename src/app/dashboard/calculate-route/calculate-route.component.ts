import {AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {NgxLoadingModule} from "ngx-loading";
import {CalculateFormComponent} from "./calculate-form/calculate-form.component";
import {Coordinates, ORSProperties, ORSRoutePlan, RouteForm} from "./calculate-route.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {FuelStationSummary} from "../cheap-fuel-stations/cheap-fuel-stations.models";
import {MapService} from "../../map/map.service";
import {PopupFuelStationComponent} from "./search-results/popup-fuel-station/popup-fuel-station.component";
import {DashboardService} from "../dashboard.service";
import {FuelStation} from "../dashboard.models";
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from "rxjs";
import {NotifierService} from "angular-notifier";
import {ORSRouteService} from "./ors-route.service";
import {DEFAULT_LOADING_SETTINGS} from "../../app.contants";

@Component({
  selector: 'app-calculate-route',
  standalone: true,
  imports: [
    NgIf,
    NgxLoadingModule,
    CalculateFormComponent,
    SearchResultsComponent,
    AsyncPipe
  ],
  templateUrl: './calculate-route.component.html'
})
export class CalculateRouteComponent implements AfterViewInit, OnDestroy {
  protected readonly DEFAULT_LOADING_SETTINGS = DEFAULT_LOADING_SETTINGS;

  private readonly onDestroy$ = new Subject<void>();

  @ViewChild(CalculateFormComponent) formComponent!: CalculateFormComponent;

  private readonly _drawPolyline$ = new Subject<[Coordinates, Coordinates]>();
  protected readonly ORSProperties$: Observable<ORSProperties> = this._drawPolyline$.asObservable().pipe(
    switchMap((coordinates) => this.orsRouteService.getRoute(coordinates[0], coordinates[1]).pipe(
      catchError(this.handleError.bind(this)),
      tap((data) => this.mapService.drawPolyLine(data.geometry.coordinates)),
      map((data: ORSRoutePlan) => data.properties))
    ));

  private readonly _allFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  private readonly _filteredFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  protected readonly fuelStations$: Observable<FuelStationSummary[]> = this._filteredFuelStations$.asObservable().pipe(tap(console.log));

  private readonly _isLoading$: Subject<boolean> = new Subject();
  protected readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  constructor(
    private readonly mapService: MapService,
    private readonly resolver: ViewContainerRef,
    private readonly dashboardService: DashboardService,
    private readonly notifierService: NotifierService,
    private readonly orsRouteService: ORSRouteService
  ) {
  }

  ngAfterViewInit() {
    this.formComponent.radius
      .valueChanges.pipe(takeUntil(this.onDestroy$), distinctUntilChanged(), tap((radius) => this.mapService.appendBufferToPolyLine(radius)))
      .subscribe();

    this.formComponent.amount
      .valueChanges.pipe(
        takeUntil(this.onDestroy$),
        tap((amount) => this.mapService.appendOrRemoveFuelStation(amount)),
        withLatestFrom(this._allFuelStations$.asObservable()),
        tap(([ amount, fuelStations ]) => this._filteredFuelStations$.next(fuelStations.slice(0, amount))),
      ).subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.onDestroy$.unsubscribe();
    this.mapService.clearMapLayers();
  }

  protected fuelStationIsSelected(fuelStation: FuelStationSummary) {
    this.dashboardService.findFuelStationById(fuelStation.id).subscribe((detail: FuelStation) => {
      const component = this.resolver.createComponent(PopupFuelStationComponent);
      component.instance.fuelStation = detail;

      const coordinates: Coordinates = { lat: fuelStation.lat, lon: fuelStation.lon };
      this.mapService.openPopup(coordinates, component.location.nativeElement);
      this.mapService.flyTo(coordinates);
    })
  }

  protected onFormSubmit(formValues: RouteForm): void {
    this._isLoading$.next(true);
    const bufferLayer = this.mapService.bufferLayer?.toGeoJSON();

    if (bufferLayer && bufferLayer.type === "FeatureCollection" && bufferLayer.features[0].geometry.type === "Polygon") {
      const coordinates = bufferLayer.features[0].geometry.coordinates;

      this.dashboardService.getAllFuelStationsOnCoordinates(coordinates, formValues.fuelType).pipe(
        catchError(this.handleError.bind(this)),
        tap((fuelStations) => {
          this._isLoading$.next(false);
          const sortedFuelStations = fuelStations.sort((a, b) => a.price - b.price);
          this.mapService.appendAllFuelStationSummaries(sortedFuelStations, formValues.amount)
          this._allFuelStations$.next(sortedFuelStations);
          // Manually emits the amount when
          this.formComponent.amount.updateValueAndValidity();
        }),
      ).subscribe();
    }
  }

  protected setRouteAndCenterMiddle(coordinates: [Coordinates, Coordinates]): void {
    this._drawPolyline$.next(coordinates)
  }

  private handleError() {
    this.notifierService.show({ type: 'error',  message: `Something went wrong!`});
    return EMPTY;
  }
}
