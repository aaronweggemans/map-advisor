import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../shared/components/map/map.service';
import { CheapFuelStationsComponent } from './cheap-fuel-stations.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';

describe('CheapFuelStationsComponent', () => {
  let spectator: Spectator<CheapFuelStationsComponent>;
  const createComponent = createComponentFactory({
    component: CheapFuelStationsComponent,
    providers: [
      mockProvider(CheapFuelStationsService),
      mockProvider(MapService),
      mockProvider(ActivatedRoute),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
