import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let spectator: Spectator<DetailsComponent>;
  const createComponent = createComponentFactory({
    component: DetailsComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
