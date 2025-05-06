import { ActivatedRoute } from '@angular/router';
import { MapComponent } from './map.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator';

describe('MapComponent', () => {
  let spectator: Spectator<MapComponent>;
  const createComponent = createComponentFactory({
    component: MapComponent,
    providers: [mockProvider(ActivatedRoute)],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
