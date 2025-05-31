import {createHttpFactory, SpectatorHttp} from "@ngneat/spectator";
import {ORSRouteService} from "./ors-route.service";

describe('CalculateRouteService', () => {
  let spectator: SpectatorHttp<ORSRouteService>;
  const createHttp = createHttpFactory({
    service: ORSRouteService,
  });

  beforeEach(() => {
    spectator = createHttp();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
