import { createHttpFactory, SpectatorHttp } from '@ngneat/spectator';
import { CheapFuelStationsService } from './cheap-fuel-stations.service';

describe('CheapFuelStationsService', () => {
  let spectator: SpectatorHttp<CheapFuelStationsService>;
  const createHttp = createHttpFactory({
    service: CheapFuelStationsService,
  });

  beforeEach(() => {
    spectator = createHttp();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
