import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarDetailFuelPricesComponent } from './sidebar-detail-fuel-prices/sidebar-detail-fuel-prices.component';
import { TileTheme } from '../map.component.models';

@Component({
  selector: 'app-map-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarDetailFuelPricesComponent],
  templateUrl: './map-menu.component.html',
  styleUrl: './map-menu.component.scss',
})
export class MapMenuComponent {
  @Input() theme: TileTheme = 'LIGHT';

  openendSidebar: SidebarDetails = {
    fuelPrices: false,
  };

  openOrCloseSidebar() {
    this.openendSidebar = {
      ...this.openendSidebar,
      fuelPrices: !this.openendSidebar.fuelPrices,
    };
  }
}

interface SidebarDetails {
  fuelPrices: boolean;
}
