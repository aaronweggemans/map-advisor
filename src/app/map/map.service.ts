import {Injectable} from '@angular/core';
import {
  Circle,
  circle, GeoJSON, geoJSON,
  icon,
  LatLngExpression, LayerGroup,
  layerGroup,
  Map,
  marker,
  Marker, Polyline,
  polyline,
  tileLayer
} from 'leaflet';
import {FuelStationSummary} from '../dashboard/cheap-fuel-stations/cheap-fuel-stations.models';
import {
  DARK_TILE_LAYER_THEME,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
  DFEAULT_TILE_LAYER_THEME,
} from '../app.contants';
import {ROUTE_LOCATION, TileTheme} from './map.component.models';
import {BehaviorSubject, Observable, Subject, takeUntil} from 'rxjs';
import {buffer, lineString} from '@turf/turf';
import {Feature, LineString, Position} from 'geojson';
import {Coordinates} from "../dashboard/calculate-route/calculate-route.models";

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;
  private routeMarkers: Partial<Record<ROUTE_LOCATION, Marker>> = {};

  private _allMapLayers = layerGroup();
  private _theme = layerGroup();
  private PDOKLayer = layerGroup();
  private turfLineLayer: Polyline | null = null;

  private _allPlacedFuelStations: LayerGroup = layerGroup();

  public bufferLayer: GeoJSON | null = null;
  private turfLine: Feature<LineString> | null = null;

  private readonly _onDestroy$ = new Subject<void>();

  private readonly _foundGasStationId$: Subject<number> = new Subject<number>();
  public readonly foundGasStationId$: Observable<number> = this._foundGasStationId$.asObservable().pipe(takeUntil(this._onDestroy$));

  private readonly _theme$: BehaviorSubject<TileTheme> = new BehaviorSubject<TileTheme>('LIGHT');
  public readonly theme$: Observable<TileTheme> = this._theme$.asObservable();

  private fuelStations: FuelStationSummary[] = [];

  public setMap(map: Map): void {
    this._map = map;
    this.switchTheme('LIGHT');
  }

  public switchTheme(theme: TileTheme) {
    this._theme.clearLayers();

    const lightTheme = tileLayer(DFEAULT_TILE_LAYER_THEME);
    const darkTheme = tileLayer(DARK_TILE_LAYER_THEME);

    if (theme === 'LIGHT') {
      this._theme.addLayer(lightTheme);
    } else {
      this._theme.addLayer(darkTheme);
    }

    this._theme$.next('LIGHT');
    this._map.addLayer(this._theme);
  }

  appendFuelStationToLayer(fuelStation: FuelStationSummary) {
    const appendCirclesToMapLayer = circle(
      {lat: fuelStation.lat, lng: fuelStation.lon},
      {radius: 10, color: this.setFadeColorOnNumber(fuelStation.price_indication!)}
    );

    appendCirclesToMapLayer.addTo(this._allPlacedFuelStations)
  }

  public clearDots() {
    if (this._allPlacedFuelStations) this._map.removeLayer(this._allPlacedFuelStations);
  }

  public appendAllFuelStationSummaries(fuelStations: FuelStationSummary[], amount: number) {
    if (this._allPlacedFuelStations) this._map.removeLayer(this._allPlacedFuelStations);
    this._allPlacedFuelStations = layerGroup();
    this.fuelStations = fuelStations.sort((a, b) => a.price - b.price);
    const amountOfFuelStations = fuelStations.slice(0, amount)
    const fuelStationSummaries = this._calculatePriceIndication(amountOfFuelStations);
    fuelStationSummaries.forEach((fuelStation) => this.appendFuelStationToLayer(fuelStation));
    this._allPlacedFuelStations.addTo(this._map);
  }

  public appendOrRemoveFuelStation(amount: number): void {
    if (this._allPlacedFuelStations) this._map.removeLayer(this._allPlacedFuelStations);
    this._allPlacedFuelStations = layerGroup();
    const amountOfFuelStations = this.fuelStations.slice(0, amount)
    const fuelStationSummaries = this._calculatePriceIndication(amountOfFuelStations);
    fuelStationSummaries.forEach((fuelStation) => this.appendFuelStationToLayer(fuelStation));
    this._allPlacedFuelStations.addTo(this._map);
  }

  flyTo(coordinates: Coordinates): void {
    this._map.flyTo([coordinates.lat, coordinates.lon], 13, {animate: true});
  }

  appendMarker(lat: number, lng: number, layer: ROUTE_LOCATION) {
    if (this.turfLineLayer) this._map.removeLayer(this.turfLineLayer);
    if (this.bufferLayer) this._map.removeLayer(this.bufferLayer);

    const existingMarker = this.routeMarkers[layer];
    if (existingMarker) {
      this._map.removeLayer(existingMarker);
      delete this.routeMarkers[layer];
    }

    // Maak nieuwe marker aan
    const customMarker = icon({
      iconUrl: 'assets/map-assets/marker.png',
      iconSize: [35, 35],
      iconAnchor: [15, 35]
    });

    const newMarker = marker([lat, lng], { icon: customMarker });
    newMarker.addTo(this.PDOKLayer);
    this.PDOKLayer.addTo(this._map);

    this.routeMarkers[layer] = newMarker;
  }

  public drawPolyLine(route: number[][]) {
    const latLngCasting = route.map((latlng) => [latlng[1], latlng[0]]);
    this.turfLineLayer = polyline(latLngCasting as LatLngExpression[], { color: '#4787B4',  weight: 5, opacity: 0.8 });;
    this.turfLineLayer.addTo(this._map);
    this._map.fitBounds(this.turfLineLayer.getBounds());
    this.turfLine = lineString(route as Position[]);
  }

  public appendBufferToPolyLine(radius: number): void {
    const bufferRadius = buffer(this.turfLine!, radius / 1000, {units: 'kilometers'});
    if (this.bufferLayer) this._map.removeLayer(this.bufferLayer);
    this.bufferLayer = geoJSON(bufferRadius, {style: {color: '#5C636B', weight: 5, fillOpacity: 0.3}}).addTo(this._map);
  }


  clearMapLayers() {
    this._allMapLayers.clearLayers();
  }

  centerBackToDefaultLocation() {
    this._map.flyTo(
      {lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE},
      DEFAULT_ZOOM,
      {
        animate: false,
      }
    );
  }

  cleanupObservables() {
    this._onDestroy$.next();
  }

  private setFadeColorOnNumber(percentage: number) {
    const value = percentage / 100;
    const hue = ((1 - value) * 120).toString(10);
    return ['hsl(', hue, ',100%,50%)'].join('');
  }

  private _calculatePriceIndication(fuelStations: FuelStationSummary[]): FuelStationSummary[] {
    const highestCosts = Math.max(...fuelStations.map((station) => station.price));
    const lowestCosts = Math.min(...fuelStations.map((station) => station.price));

    return fuelStations.map((station: FuelStationSummary) => ({
      ...station,
      price_indication: Math.floor(((station.price - lowestCosts) / (highestCosts - lowestCosts)) * 100),
    })).sort((a, b) => a.price_indication - b.price_indication);
  }
}
