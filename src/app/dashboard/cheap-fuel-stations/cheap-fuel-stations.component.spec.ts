import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../map/map.service';
import { CheapFuelStationsComponent } from './cheap-fuel-stations.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator/jest';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';
import { NotifierService } from 'angular-notifier';
import { of } from 'rxjs';

describe('CheapFuelStationsComponent', () => {
  let spectator: Spectator<CheapFuelStationsComponent>;
  const createComponent = createComponentFactory({
    component: CheapFuelStationsComponent,
    providers: [
      mockProvider(CheapFuelStationsService, {
        getFuelStations: () => of(),
      }),
      mockProvider(MapService),
      mockProvider(ActivatedRoute, {
        params: of({ fuelType: 'lpg' }),
      }),
      mockProvider(NotifierService),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
