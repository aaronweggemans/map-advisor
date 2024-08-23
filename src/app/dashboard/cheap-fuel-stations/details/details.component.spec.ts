import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { DetailsComponent } from './details.component';
import { mockProvider } from '@ngneat/spectator/jest';
import { CheapFuelStationsService } from '../cheap-fuel-stations.service';
import { of } from 'rxjs';
import { FuelStation } from '../cheap-fuel-stations.models';

describe('DetailsComponent', () => {
  let spectator: Spectator<DetailsComponent>;
  const createComponent = createComponentFactory({
    component: DetailsComponent,
    providers: [
      mockProvider(CheapFuelStationsService, {
        findFuelStationById: () =>
          of({
            id: 1,
            name: 'Akko',
            brand_name: 'ADSF',
            display_name: 'ADD',
            lat: 1,
            lon: 1,
            street: 'DD',
            postal_code: '5454ee',
            city: 'Lelystad',
            coordinate: {
              id: null,
              south_west_lat: 0,
              south_west_lon: 0,
              north_east_lat: 0,
              north_east_lon: 0,
            },
            price_indication: 1,
            prices: [],
          } satisfies FuelStation),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
