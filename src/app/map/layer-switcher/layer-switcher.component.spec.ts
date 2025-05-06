import { LayerSwitcherComponent } from './layer-switcher.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe('LayerSwitcherComponent', () => {
  let spectator: Spectator<LayerSwitcherComponent>;
  const createComponent = createComponentFactory({
    component: LayerSwitcherComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
