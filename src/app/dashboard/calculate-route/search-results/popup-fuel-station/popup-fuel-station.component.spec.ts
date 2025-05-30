import {createComponentFactory, Spectator} from "@ngneat/spectator";
import {PopupFuelStationComponent} from "./popup-fuel-station.component";

describe('PopupFuelStationComponent', () => {
  let spectator: Spectator<PopupFuelStationComponent>;

  const createComponent = createComponentFactory({
    component: PopupFuelStationComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
