import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TileTheme} from "../../map.component.models";
import {MapService} from "../../map.service";
import {SidebarItem} from "../map-menu.modals";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-sidebar-list',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgForOf],
  templateUrl: './sidebar-list.component.html',
  styleUrl: './sidebar-list.component.scss'
})
export class SidebarListComponent {
  @Input({ required: true }) theme!: TileTheme;
  @Input({ required: true }) list!: SidebarItem[];
  @Output() closeSidebar: EventEmitter<void> = new EventEmitter();

  constructor(private _mapService: MapService) {}

  protected centerToDefaultLocation(): void {
    this._mapService.clearMapLayers();
    this._mapService.centerBackToDefaultLocation();
    this.closeSidebar.emit();
  }
}
