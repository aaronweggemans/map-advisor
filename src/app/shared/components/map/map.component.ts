import { Component, OnInit } from '@angular/core';
import { map } from 'leaflet';
import { MapMenuComponent } from './map-menu/map-menu.component';
import { MapSidebarComponent } from './map-sidebar/map-sidebar.component';
import { MapService } from './map.service';
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from '../../../app.contants';
import { LayerSwitcherComponent } from './layer-switcher/layer-switcher.component';
import { TileTheme } from './map.component.models';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapMenuComponent, MapSidebarComponent, LayerSwitcherComponent],
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit {
  public theme: TileTheme = 'LIGHT';

  constructor(private _mapService: MapService) {}

  ngOnInit(): void {
    const leafletMap = map('map', {
      attributionControl: false,
      zoomControl: false,
    }).setView([DEFAULT_LATITUDE, DEFAULT_LONGITUDE], DEFAULT_ZOOM);

    this._mapService.setMap(leafletMap);
  }

  setTheme(theme: TileTheme) {
    this.theme = theme;
    this._mapService.switchTheme(theme);
  }
}
