import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FuelStationSummary} from "../../cheap-fuel-stations/cheap-fuel-stations.models";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
  ],
  templateUrl: './search-results.component.html',
})
export class SearchResultsComponent {
  @Input({ required: true }) results!: FuelStationSummary[];
  @Output() selectedFuelStation = new EventEmitter<FuelStationSummary>();

  protected showFuelStationDetails(fuelStation: FuelStationSummary): false {
    this.selectedFuelStation.emit(fuelStation)
    return false;
  }
}
