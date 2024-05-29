import { BarChartComponent } from './bar-chart.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('BarChartComponent', () => {
  let spectator: Spectator<BarChartComponent>;
  const createComponent = createComponentFactory({
    component: BarChartComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
