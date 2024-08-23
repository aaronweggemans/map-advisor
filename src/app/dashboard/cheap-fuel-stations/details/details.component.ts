import { Component, Input } from '@angular/core';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { map, Subject, switchMap } from 'rxjs';
import { CheapFuelStationsService } from '../cheap-fuel-stations.service';
import { CommonModule } from '@angular/common';
import { FuelStation } from '../cheap-fuel-stations.models';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './details.component.html',
})
export class DetailsComponent {
  @Input() fontColor: string = '';
  @Input({ required: true }) set gasStationId(gasStationId: number) {
    this._foundGasStation$.next(gasStationId);
  }

  private _toBarChartData = (fuelStation: FuelStation) => ({
    ...fuelStation,
    barChartData: {
      labels: fuelStation.prices.map((prices) => prices.fueltype),
      data: fuelStation.prices.map((prices) => prices.price.toString()),
    },
  });

  private readonly _foundGasStation$: Subject<number> = new Subject<number>();
  public readonly foundFuelStation$ = this._foundGasStation$.pipe(
    switchMap((id) => this._cheapFuelStationService.findFuelStationById(id)),
    map(this._toBarChartData)
  );

  public findGoogleImage(latitude: number, longitude: number): string {
    return `http://maps.google.com/maps/api/staticmap?center="${latitude},${longitude}"&zoom=15&size=300x150&sensor=false&key=AIzaSyBXkn_iiij3dPDUhyarJPe6qVVn2MGOY8I`;
  }

  constructor(private _cheapFuelStationService: CheapFuelStationsService) {}
}
