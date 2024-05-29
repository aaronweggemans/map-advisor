import { ActivatedRoute } from '@angular/router';
import { MapMenuComponent } from './map-menu.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator';

describe('MapMenuComponent', () => {
  let spectator: Spectator<MapMenuComponent>;
  const createComponent = createComponentFactory({
    component: MapMenuComponent,
    providers: [mockProvider(ActivatedRoute)],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
