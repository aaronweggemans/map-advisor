import {Injectable} from '@angular/core';
import {
  Circle,
  circle, GeoJSON, geoJSON,
  icon,
  LatLngExpression,
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

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;
  private _allMapLayers = layerGroup();
  private _theme = layerGroup();
  private pdokFoundOnAddressLayerA = layerGroup();
  private pdokFoundOnAddressLayerB = layerGroup();

  private bufferLayer: GeoJSON | null = null;
  private turfLine: Feature<LineString> | null = null;

  private readonly _onDestroy$ = new Subject<void>();

  private readonly _foundGasStationId$: Subject<number> = new Subject<number>();
  public readonly foundGasStationId$: Observable<number> = this._foundGasStationId$.asObservable().pipe(takeUntil(this._onDestroy$));

  private readonly _theme$: BehaviorSubject<TileTheme> = new BehaviorSubject<TileTheme>('LIGHT');
  public readonly theme$: Observable<TileTheme> = this._theme$.asObservable();

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

  appendFuelStationToMap(fuelStation: FuelStationSummary): Circle {
    const circleLocation = circle(
      {lat: fuelStation.lat, lng: fuelStation.lon},
      {radius: 10, color: this.setFadeColorOnNumber(fuelStation.price_indication!)}
    );

    this._allMapLayers.addLayer(circleLocation);
    this._map.addLayer(this._allMapLayers);

    circleLocation.on('click', () => {
      this._foundGasStationId$.next(fuelStation.id);
      this.flyTo(fuelStation.lat, fuelStation.lon);
    });

    return circleLocation;
  }

  flyTo(lat: number, lng: number, zoom = 13): void {
    this._map.flyTo({ lat, lng }, zoom, { animate: true });
  }

  /**
   * Dit moet echt mooier.
   * @param lat
   * @param lng
   * @param layer
   */
  appendMarker(lat: number, lng: number, layer: ROUTE_LOCATION) {
    if(this.pdokFoundOnAddressLayerA.getLayers() && layer === ROUTE_LOCATION.LOCATION_A) {
      this.pdokFoundOnAddressLayerA.clearLayers();
    }

    if(this.pdokFoundOnAddressLayerB.getLayers() && layer === ROUTE_LOCATION.LOCATION_B) {
      this.pdokFoundOnAddressLayerB.clearLayers();
    }

    const customMarker = icon({ iconUrl: 'assets/map-assets/marker.png',  iconSize: [35, 35],  iconAnchor: [15, 35] });
    const markerLocation: Marker = marker([lat, lng], { icon: customMarker });

    if(layer === ROUTE_LOCATION.LOCATION_A) {
      this.pdokFoundOnAddressLayerA.addLayer(markerLocation);
      this._map.addLayer(this.pdokFoundOnAddressLayerA);
    }

    if(layer === ROUTE_LOCATION.LOCATION_B) {
      this.pdokFoundOnAddressLayerB.addLayer(markerLocation);
      this._map.addLayer(this.pdokFoundOnAddressLayerB);
    }
  }

  public drawPolyLine(route: number[][]) {
    const latLngCasting = route.map((latlng) => [latlng[1], latlng[0]]);
    const routeLine: Polyline = polyline(latLngCasting as LatLngExpression[], { color: '#4787B4',  weight: 5, opacity: 0.8 }).addTo(this._map);
    this._map.fitBounds(routeLine.getBounds());
    this.turfLine = lineString(route as Position[]);
  }

  public appendBufferToPolyLine(radius: number): void {
    const bufferRadius = buffer(this.turfLine!, radius / 1000, { units: 'kilometers' });
    if (this.bufferLayer) { this._map.removeLayer(this.bufferLayer); }
    this.bufferLayer = geoJSON(bufferRadius, { style: { color: '#5C636B', weight: 5, fillOpacity: 0.3 }}).addTo(this._map);
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
}
