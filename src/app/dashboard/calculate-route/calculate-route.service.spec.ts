import {createHttpFactory, SpectatorHttp} from "@ngneat/spectator";
import {CalculateRouteService} from "./calculate-route.service";

describe('CalculateRouteService', () => {
  let spectator: SpectatorHttp<CalculateRouteService>;
  const createHttp = createHttpFactory({
    service: CalculateRouteService,
  });

  beforeEach(() => {
    spectator = createHttp();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
