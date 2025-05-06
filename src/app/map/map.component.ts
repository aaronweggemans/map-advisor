import { Component, OnInit } from '@angular/core';
import { map, MapOptions } from 'leaflet';
import { MapMenuComponent } from './map-menu/map-menu.component';
import { MapSidebarComponent } from './map-sidebar/map-sidebar.component';
import { MapService } from './map.service';
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from '../app.contants';
import { LayerSwitcherComponent } from './layer-switcher/layer-switcher.component';
import { TileTheme } from './map.component.models';
import {BreakpointObserver} from "@angular/cdk/layout";
import {Observable, map as rxjsMap } from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MapMenuComponent, MapSidebarComponent, LayerSwitcherComponent, NgIf, AsyncPipe],
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit {
  protected readonly isTablet$: Observable<boolean> = this.breakpointObserver.observe('(min-width: 960px)').pipe(
    rxjsMap((state) => state.matches)
  );

  protected theme: TileTheme = 'LIGHT';
  private readonly mapOptions: MapOptions = { attributionControl: false, zoomControl: false };

  constructor(private readonly mapService: MapService, private readonly breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    const leafletMap = map('map', this.mapOptions).setView([DEFAULT_LATITUDE, DEFAULT_LONGITUDE], DEFAULT_ZOOM);
    this.mapService.setMap(leafletMap);
  }

  protected setTheme(theme: TileTheme): void {
    this.mapService.switchTheme(theme);
    this.theme = theme;
  }
}
