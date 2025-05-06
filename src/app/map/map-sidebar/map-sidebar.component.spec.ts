import { MapSidebarComponent } from './map-sidebar.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('MapSidebarComponent', () => {
  let spectator: Spectator<MapSidebarComponent>;
  const createComponent = createComponentFactory({
    component: MapSidebarComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
