import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TileTheme } from '../map.component.models';
import { SidebarListComponent } from "./sidebar-list/sidebar-list.component";
import {SidebarItem} from "./map-menu.modals";

@Component({
  selector: 'app-map-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarListComponent],
  templateUrl: './map-menu.component.html',
  styleUrl: './map-menu.component.scss',
})
export class MapMenuComponent {
  @Input() theme: TileTheme = 'LIGHT';

  protected readonly SIDE_BAR_FUEL_PRICES: SidebarItem[] = [
    { url: "/cheap-fuel-stations/lpg", title: "Find on LPG" },
    { url: "/cheap-fuel-stations/cng", title: "Find on cng (CNG)" },
    { url: "/cheap-fuel-stations/diesel", title: "Find on diesel (Diesel B7)" },
    { url: "/cheap-fuel-stations/premium_diesel", title: "Find on premium diesel" },
    { url: "/cheap-fuel-stations/euro98", title: "Find on euro 95" },
    { url: "/cheap-fuel-stations/euro95", title: "Find on euro 98 "},
  ];

  protected readonly SIDE_BAR_DRAW: SidebarItem[] = [
    { url: "/calculate-route-for-cheap-fuel-stations", title: "Find fuel station on route" },
  ];

  protected openedSidebar: SidebarDetails = { fuelPrices: false, drawing: false };

  protected openOrClose(sidebarOption: SidebarOptions): false {
    this.closeSidebar();
    this.openedSidebar[sidebarOption] = !this.openedSidebar[sidebarOption];
    return false;
  }

  protected closeSidebar(): false {
    this.openedSidebar = { fuelPrices: false, drawing: false };
    return false;
  }
}

type SidebarOptions = keyof SidebarDetails;

type SidebarDetails = {
  fuelPrices: boolean;
  drawing: boolean;
}
