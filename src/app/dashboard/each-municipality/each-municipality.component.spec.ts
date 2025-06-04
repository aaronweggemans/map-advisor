import { MapService } from '../../map/map.service';
import { EachMunicipalityComponent } from './each-municipality.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator/jest';
import { NotifierService } from 'angular-notifier';

describe('EachMunicipalityComponent', () => {
  let spectator: Spectator<EachMunicipalityComponent>;
  const createComponent = createComponentFactory({
    component: EachMunicipalityComponent,
    providers: [
      mockProvider(MapService),
      mockProvider(NotifierService),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
