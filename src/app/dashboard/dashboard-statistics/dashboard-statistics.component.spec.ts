import { DashboardStatisticsComponent } from './dashboard-statistics.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('DashboardStatisticsComponent', () => {
  let spectator: Spectator<DashboardStatisticsComponent>;
  const createComponent = createComponentFactory({
    component: DashboardStatisticsComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
