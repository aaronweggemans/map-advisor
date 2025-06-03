import {Injectable} from '@angular/core';
import {
  circle,
  icon,
  LatLngBounds,
  Layer, LayerGroup,
  layerGroup,
  Map,
  marker,
  popup,
  tileLayer,
} from 'leaflet';
import {
  DARK_TILE_LAYER_THEME,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
  DFEAULT_TILE_LAYER_THEME,
} from '../app.contants';
import {TileTheme} from './map.component.models';
import {Coordinates} from "../dashboard/calculate-route/calculate-route.models";

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;

  private _theme = layerGroup();

  public setMap(map: Map): void {
    this._map = map;
    this.switchTheme('LIGHT');
  }

  public switchTheme(theme: TileTheme): void {
    this._theme.clearLayers();

    const lightTheme = tileLayer(DFEAULT_TILE_LAYER_THEME);
    const darkTheme = tileLayer(DARK_TILE_LAYER_THEME);

    if (theme === 'LIGHT') {
      this._theme.addLayer(lightTheme);
    } else {
      this._theme.addLayer(darkTheme);
    }

    this._map.addLayer(this._theme);
  }

  public appendCircleOnColorIndication(lat: number, lng: number, color: string, layer: LayerGroup): void {
    const circleMarker = circle({lat, lng}, {radius: 20, color});
    circleMarker.addTo(layer);
    layer.addTo(this._map);
  }

  public openPopup(coordinates: Coordinates, content: string | HTMLElement): void {
    popup()
      .setLatLng({ lat: coordinates.lat, lng: coordinates.lon })
      .setContent(content)
      .openOn(this._map);
  }

  public flyTo(coordinates: Coordinates, zoom = 13): void {
    this._map.flyTo([coordinates.lat, coordinates.lon], zoom, {animate: true});
  }

  public appendMarker(lat: number, lng: number, layer: LayerGroup): void {
    layer.clearLayers()

    // Maak nieuwe marker aan
    const customMarker = icon({
      iconUrl: 'assets/map-assets/marker.png',
      iconSize: [35, 35],
      iconAnchor: [15, 35]
    });

    const newMarker = marker([lat, lng], { icon: customMarker });
    newMarker.addTo(layer);
    layer.addTo(this._map);
  }

  public removeLayerFromMap(layer: LayerGroup): void {
    this._map.removeLayer(layer);
  }

  public clearMapLayers(): void {
    this._map.closePopup();
    this.centerBackToDefaultLocation();
  }

  public addLayerToMap(layer: Layer): void {
    layer.addTo(this._map);
  }

  public flyWithZoom(latlng: LatLngBounds) {
    this._map.fitBounds(latlng);
  }

  public centerBackToDefaultLocation(): void {
    this._map.flyTo(
      {lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE},
      DEFAULT_ZOOM,
      {
        animate: false,
      }
    );
  }
}
