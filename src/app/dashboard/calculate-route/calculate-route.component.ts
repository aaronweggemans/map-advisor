import {Component} from '@angular/core';
import {NgIf} from "@angular/common";
import {NgxLoadingModule} from "ngx-loading";
import {CalculateFormComponent} from "./calculate-form/calculate-form.component";
import {ORSProperties} from "./calculate-route.models";
import {SearchResultsComponent} from "./search-results/search-results.component";
import {FuelStationSummary} from "../cheap-fuel-stations/cheap-fuel-stations.models";

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
}
