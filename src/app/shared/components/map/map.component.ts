import { Component, OnInit } from '@angular/core';
import { map, tileLayer } from 'leaflet';
import { MapMenuComponent } from './map-menu/map-menu.component';
import { MapSidebarComponent } from './map-sidebar/map-sidebar.component';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapMenuComponent, MapSidebarComponent],
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit {
  constructor(private _mapService: MapService) {}

  ngOnInit(): void {
    const leafletMap = map('map', {
      attributionControl: false,
      zoomControl: false,
    }).setView([52.136375, 6.594918], 7);

    tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
      }
    ).addTo(leafletMap);

    this._mapService.setMap(leafletMap);
  }
}
