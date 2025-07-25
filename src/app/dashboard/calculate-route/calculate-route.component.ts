import {AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {CalculateFormComponent} from "./calculate-form/calculate-form.component";
import {Coordinates, ORSProperties, ORSRoutePlan, RouteForm} from "./calculate-route.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {MapService} from "../../map/map.service";
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
import {LoadingSpinnerComponent} from "../../shared/components/loading-spinner/loading-spinner.component";
import {PopupFuelStationComponent} from "../../shared/components/popup-fuel-station/popup-fuel-station.component";

@Component({
  selector: 'app-calculate-route',
  standalone: true,
  imports: [
    NgIf,
    CalculateFormComponent,
    SearchResultsComponent,
    AsyncPipe,
    LoadingSpinnerComponent
  ],
  templateUrl: './calculate-route.component.html'
})
export class CalculateRouteComponent implements AfterViewInit, OnDestroy {
  private readonly allPlacedFuelStations: LayerGroup = layerGroup();

  private bufferLayer: GeoJSON | null = null;
  private turfLine: Feature<LineString> | null = null;
  private turfLineLayer: Polyline | null = null;

  private readonly onDestroy$ = new Subject<void>();

  @ViewChild(CalculateFormComponent) formComponent!: CalculateFormComponent;

  private readonly _drawPolyline$ = new Subject<[Coordinates, Coordinates]>();
  protected readonly ORSProperties$: Observable<ORSProperties> = this._drawPolyline$.asObservable().pipe(
    tap(() => this.setIsLoading(true)),
    switchMap((coordinates: [Coordinates, Coordinates]) => this.orsRouteService.getRoute(coordinates[0], coordinates[1]).pipe(
      catchError(this.handleError.bind(this)),
      tap((data) => {
        this.formComponent.radius.enable({ emitEvent: false });
        this.formComponent.amount.enable();
        this.formComponent.fuelType.enable();
        this.setIsLoading(false)
        this.drawPolyLine(data.geometry.coordinates)
      }),
      map((data: ORSRoutePlan) => data.properties)),
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
          filterFuelStations.forEach(({lat, lon, fade}) => {
            this.mapService.appendCircleOnColorIndication(lat, lon, fade, this.allPlacedFuelStations)
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
    if(this.turfLineLayer) this.mapService.removeLayerFromMap(this.turfLineLayer);
  }

  protected setIsLoading(isLoading: boolean): void {
    this._isLoading$.next(isLoading);
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
    this._allFuelStations$.next([]);
    this.allPlacedFuelStations.clearLayers();
    if(this.turfLineLayer) this.mapService.removeLayerFromMap(this.turfLineLayer)
    if(this.bufferLayer) this.mapService.removeLayerFromMap(this.bufferLayer)
    this._drawPolyline$.next(coordinates);
    const locationA: LatLngLiteral = { lat: coordinates[0].lat, lng: coordinates[0].lon };
    const locationB: LatLngLiteral = { lat: coordinates[1].lat, lng: coordinates[1].lon };
    this.mapService.flyWithZoom(latLngBounds(locationA, locationB));
  }

  private drawPolyLine(route: number[][]) {
    const latLngCasting = route.map((latlng) => [latlng[1], latlng[0]]);
    this.turfLineLayer = polyline(latLngCasting as LatLngExpression[], { color: '#071C39',  weight: 5, opacity: 0.8 });
    this.mapService.addLayerToMap(this.turfLineLayer)
    this.turfLine = lineString(route);
  }

  private appendBufferToPolyLine(radius: number): void {
    const bufferRadius = buffer(this.turfLine!, radius / 1000, {units: 'kilometers'});
    this.bufferLayer = geoJSON(bufferRadius, {style: {color: '#BDC9CD', weight: 5, fillOpacity: 0.3}})
    this.mapService.addLayerToMap(this.bufferLayer)
  }

  private handleError() {
    this.notifierService.show({ type: 'error',  message: `Er ging iets mis met de aanvraag!`});
    this._isLoading$.next(false);
    return EMPTY;
  }
}
