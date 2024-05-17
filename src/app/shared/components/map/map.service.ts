import { Injectable } from '@angular/core';
import { Circle, circle, layerGroup, Map } from 'leaflet';
import {
  FuelStation,
  FuelStationSummary,
} from '../../../dashboard/cheap-fuel-stations/cheap-fuel-stations.models';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;
  private _allMapLayers = layerGroup();

  private _setFoundedGasStation$ = new Subject<FuelStation>();
  public readonly foundedGasStation$: Observable<FuelStation> =
    this._setFoundedGasStation$.asObservable();

  constructor() {}

  setMap(map: Map): void {
    this._map = map;
  }

  appendFuelStationToMap(fuelStation: FuelStationSummary): Circle {
    const coordinates = {
      lat: fuelStation.lat,
      lng: fuelStation.lon,
    };

    const circleLocation = circle(coordinates, {
      radius: 10,
      color: this.setFadeColorOnNumber(fuelStation.price_indication!),
    });

    this._allMapLayers.addLayer(circleLocation);
    // circleLocation.on('click', () => {
    //   this._map.flyTo(coordinates, 14);
    //   this._setFoundedGasStation$.next(fuelStation);
    // });
    this._map.addLayer(this._allMapLayers);
    return circleLocation;
  }

  clearMapLayers() {
    this._allMapLayers.clearLayers();
  }

  private setFadeColorOnNumber(percentage: number) {
    const value = percentage / 100;
    const hue = ((1 - value) * 120).toString(10);
    return ['hsl(', hue, ',100%,50%)'].join('');
  }
}
