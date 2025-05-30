import {Component, ViewContainerRef} from '@angular/core';
import {NgIf} from "@angular/common";
import {NgxLoadingModule} from "ngx-loading";
import {CalculateFormComponent} from "./calculate-form/calculate-form.component";
import {Coordinates, ORSProperties} from "./calculate-route.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {FuelStationSummary} from "../cheap-fuel-stations/cheap-fuel-stations.models";
import {MapService} from "../../map/map.service";
import {PopupFuelStationComponent} from "./search-results/popup-fuel-station/popup-fuel-station.component";
import {DashboardService} from "../dashboard.service";
import {FuelStation} from "../dashboard.models";
import {distinctUntilChanged} from "rxjs";

@Component({
  selector: 'app-calculate-route',
  standalone: true,
  imports: [
    NgIf,
    NgxLoadingModule,
    CalculateFormComponent,
    SearchResultsComponent
  ],
  templateUrl: './calculate-route.component.html'
})
export class CalculateRouteComponent {
  protected ORSProperties: ORSProperties | null = null;
  protected fuelStations: FuelStationSummary[] = [];

  constructor(private readonly mapService: MapService, private readonly resolver: ViewContainerRef, private readonly dashboardService: DashboardService) {
  }

  protected fuelStationIsSelected(fuelStation: FuelStationSummary) {
    this.dashboardService.findFuelStationById(fuelStation.id).pipe(distinctUntilChanged()).subscribe((detail: FuelStation) => {
      const component = this.resolver.createComponent(PopupFuelStationComponent);
      component.instance.fuelStation = detail;

      const coordinates: Coordinates = { lat: fuelStation.lat, lon: fuelStation.lon };
      this.mapService.openPopup(coordinates, component.location.nativeElement);
      this.mapService.flyTo(coordinates);
    })
  }
}
