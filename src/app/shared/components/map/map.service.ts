import { Injectable } from '@angular/core';
import { Circle, circle, layerGroup, Map, marker, tileLayer } from 'leaflet';
import { FuelStationSummary } from '../../../dashboard/cheap-fuel-stations/cheap-fuel-stations.models';
import {
  DARK_TILE_LAYER_THEME,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
  DFEAULT_TILE_LAYER_THEME,
} from '../../../app.contants';
import { TileTheme } from './map.component.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;
  private _allMapLayers = layerGroup();
  private _theme = layerGroup();

  private readonly _theme$: BehaviorSubject<TileTheme> = new BehaviorSubject(
    'LIGHT' as TileTheme
  );
  public readonly theme$ = this._theme$.asObservable();

  constructor() {}

  setMap(map: Map): void {
    this._map = map;
    this.switchTheme('LIGHT');
  }

  switchTheme(theme: TileTheme) {
    this._theme$.next(theme);
    this._map.removeLayer(this._theme);
    const defaultLayer = tileLayer(DFEAULT_TILE_LAYER_THEME);
    const blackLayer = tileLayer(DARK_TILE_LAYER_THEME);

    if (theme === 'LIGHT') {
      this._theme.addLayer(defaultLayer);
    } else {
      this._theme.addLayer(blackLayer);
    }

    this._theme.addTo(this._map);
  }

  appendFuelStationToMap(fuelStation: FuelStationSummary): Circle {
    const circleLocation = circle(
      {
        lat: fuelStation.lat,
        lng: fuelStation.lon,
      },
      {
        radius: 10,
        color: this.setFadeColorOnNumber(fuelStation.price_indication!),
      }
    );

    this._allMapLayers.addLayer(circleLocation);
    this._map.addLayer(this._allMapLayers);
    return circleLocation;
  }

  flyTo(lat: number, lng: number): void {
    this._map.flyTo({ lat, lng }, 13, { animate: false });
  }

  clearMapLayers() {
    this._allMapLayers.clearLayers();
  }

  centerBackToDefaultLocation() {
    this._map.flyTo(
      { lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE },
      DEFAULT_ZOOM,
      {
        animate: false,
      }
    );
  }

  private setFadeColorOnNumber(percentage: number) {
    const value = percentage / 100;
    const hue = ((1 - value) * 120).toString(10);
    return ['hsl(', hue, ',100%,50%)'].join('');
  }
}
