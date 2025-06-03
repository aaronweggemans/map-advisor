import {AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {NgxLoadingModule} from "ngx-loading";
import {CalculateFormComponent} from "./calculate-form/calculate-form.component";
import {Coordinates, ORSProperties, ORSRoutePlan, RouteForm} from "./calculate-route.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {MapService} from "../../map/map.service";
import {PopupFuelStationComponent} from "./search-results/popup-fuel-station/popup-fuel-station.component";
import {DashboardService} from "../dashboard.service";
import {FuelStation, FuelStationSummary} from "../dashboard.models";
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
import {
  geoJSON,
  GeoJSON,
  latLngBounds,
  LatLngExpression,
  LatLngLiteral,
  layerGroup,
  LayerGroup,
  Polyline,
  polyline
} from "leaflet";
import {buffer, lineString} from "@turf/turf";
import {Feature, LineString} from 'geojson';

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
  private readonly allPlacedFuelStations: LayerGroup = layerGroup();

  private bufferLayer: GeoJSON | null = null;
  private turfLine: Feature<LineString> | null = null;
  private turfLineLayer: Polyline | null = null;

  protected readonly DEFAULT_LOADING_SETTINGS = DEFAULT_LOADING_SETTINGS;

  private readonly onDestroy$ = new Subject<void>();

  @ViewChild(CalculateFormComponent) formComponent!: CalculateFormComponent;

  private readonly _drawPolyline$ = new Subject<[Coordinates, Coordinates]>();
  protected readonly ORSProperties$: Observable<ORSProperties> = this._drawPolyline$.asObservable().pipe(
    switchMap((coordinates) => this.orsRouteService.getRoute(coordinates[0], coordinates[1]).pipe(
      catchError(this.handleError.bind(this)),
      tap((data) => this.drawPolyLine(data.geometry.coordinates)),
      map((data: ORSRoutePlan) => data.properties))
    ));

  private readonly _allFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  private readonly _filteredFuelStations$: Subject<FuelStationSummary[]> = new Subject();
  protected readonly fuelStations$: Observable<FuelStationSummary[]> = this._filteredFuelStations$.asObservable();

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
      .valueChanges.pipe(
        takeUntil(this.onDestroy$),
        distinctUntilChanged(),
        tap(() => this.bufferLayer?.clearLayers()),
        tap((radius) => this.appendBufferToPolyLine(radius))
      )
      .subscribe();

    this.formComponent.amount
      .valueChanges.pipe(
        takeUntil(this.onDestroy$),
        withLatestFrom(this._allFuelStations$.asObservable()),
        tap(([ amount, fuelStations ]) => {
          const filterFuelStations = fuelStations.slice(0, amount);
          this._filteredFuelStations$.next(filterFuelStations)
          this.allPlacedFuelStations.clearLayers();
          filterFuelStations.forEach(({lat, lon, price_indication}) => {
            this.mapService.appendCircleOnColorIndication(lat, lon, this.setFadeColorOnNumber(price_indication!), this.allPlacedFuelStations)
          })
        }),
      ).subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.onDestroy$.unsubscribe();
    this.mapService.clearMapLayers();
    this.mapService.removeLayerFromMap(this.allPlacedFuelStations);
    if(this.bufferLayer) this.mapService.removeLayerFromMap(this.bufferLayer);
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
    const bufferLayer = this.bufferLayer?.toGeoJSON();

    if (bufferLayer && bufferLayer.type === "FeatureCollection" && bufferLayer.features[0].geometry.type === "Polygon") {
      const coordinates = bufferLayer.features[0].geometry.coordinates;

      this.dashboardService.getAllFuelStationsOnCoordinates(coordinates, formValues.fuelType).pipe(
        catchError(this.handleError.bind(this)),
        map((fuelStations) => fuelStations.sort((a, b) => a.price - b.price)),
        map(this.calculatePriceIndication),
        tap((fuelStations) => {
          this._isLoading$.next(false);
          this._allFuelStations$.next(fuelStations);
          // Manually emits the amount when
          this.formComponent.amount.updateValueAndValidity();
        }),
      ).subscribe();
    }
  }

  protected setRouteAndCenterMiddle(coordinates: [Coordinates, Coordinates]): void {
    this._drawPolyline$.next(coordinates);
    const locationA: LatLngLiteral = { lat: coordinates[0].lat, lng: coordinates[0].lon };
    const locationB: LatLngLiteral = { lat: coordinates[1].lat, lng: coordinates[1].lon };
    this.mapService.flyWithZoom(latLngBounds(locationA, locationB));
  }

  private handleError() {
    this.notifierService.show({ type: 'error',  message: `Something went wrong!`});
    return EMPTY;
  }

  private calculatePriceIndication(fuelStations: FuelStationSummary[]): FuelStationSummary[] {
    const highestCosts = Math.max(...fuelStations.map((station) => station.price));
    const lowestCosts = Math.min(...fuelStations.map((station) => station.price));

    return fuelStations.map((station: FuelStationSummary) => ({
      ...station,
      price_indication: Math.floor(((station.price - lowestCosts) / (highestCosts - lowestCosts)) * 100),
    })).sort((a, b) => a.price_indication - b.price_indication);
  }

  private setFadeColorOnNumber(percentage: number) {
    const value = percentage / 100;
    const hue = ((1 - value) * 120).toString(10);
    return ['hsl(', hue, ',100%,50%)'].join('');
  }

  private drawPolyLine(route: number[][]) {
    const latLngCasting = route.map((latlng) => [latlng[1], latlng[0]]);
    this.turfLineLayer = polyline(latLngCasting as LatLngExpression[], { color: '#4787B4',  weight: 5, opacity: 0.8 });
    this.mapService.addLayerToMap(this.turfLineLayer)
    this.turfLine = lineString(route);
  }

  private appendBufferToPolyLine(radius: number): void {
    const bufferRadius = buffer(this.turfLine!, radius / 1000, {units: 'kilometers'});
    this.bufferLayer = geoJSON(bufferRadius, {style: {color: '#5C636B', weight: 5, fillOpacity: 0.3}})
    this.mapService.addLayerToMap(this.bufferLayer)
  }
}
