import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MapService } from '../../map.service';
import { TileTheme } from '../../map.component.models';

@Component({
  selector: 'app-sidebar-detail-fuel-prices',
  standalone: true,
  imports: [RouterModule],
  styleUrls: ['./sidebar-detail-fuel-prices.component.scss'],
  templateUrl: './sidebar-detail-fuel-prices.component.html',
})
export class SidebarDetailFuelPricesComponent {
  @Input() theme: TileTheme = 'LIGHT';
  @Output() closeSidebar: EventEmitter<void> = new EventEmitter();

  constructor(private _mapService: MapService) {}

  protected centerToDefaultLocation(): void {
    this._mapService.clearMapLayers();
    this._mapService.centerBackToDefaultLocation();
    this.closeSidebar.emit();
  }
}
