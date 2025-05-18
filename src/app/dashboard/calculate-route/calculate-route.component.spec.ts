import { CalculateRouteComponent } from './calculate-route.component';
import {createComponentFactory, Spectator} from "@ngneat/spectator";

describe('CalculateRouteComponent', () => {
  let spectator: Spectator<CalculateRouteComponent>;

  const createComponent = createComponentFactory({
    component: CalculateRouteComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
