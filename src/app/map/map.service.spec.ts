import { createHttpFactory, SpectatorHttp } from '@ngneat/spectator';
import { MapService } from './map.service';

describe('MapService', () => {
  let spectator: SpectatorHttp<MapService>;
  const createHttp = createHttpFactory({
    service: MapService,
  });

  beforeEach(() => {
    spectator = createHttp();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
