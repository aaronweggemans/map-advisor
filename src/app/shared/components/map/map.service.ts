import { Injectable } from '@angular/core';
import { Map } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private _map!: Map;

  constructor() {}

  setMap(map: Map): void {
    this._map = map;
  }
}
