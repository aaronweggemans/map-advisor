import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarDetailFuelPricesComponent } from './sidebar-detail-fuel-prices.component';
import {
  Spectator,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator';

describe('SidebarDetailFuelPricesComponent', () => {
  let spectator: Spectator<SidebarDetailFuelPricesComponent>;
  const createComponent = createComponentFactory({
    component: SidebarDetailFuelPricesComponent,
    providers: [mockProvider(RouterModule), mockProvider(ActivatedRoute)],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
