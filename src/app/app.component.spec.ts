import { AppComponent } from './app.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MockComponent } from 'ng-mocks';

describe('AppComponent', () => {
  let spectator: Spectator<AppComponent>;

  const createComponent = createComponentFactory({
    component: AppComponent,
    overrideComponents: [
      [
        AppComponent,
        {
          remove: { imports: [DashboardComponent] },
          add: { imports: [MockComponent(DashboardComponent)] }
        },
      ]
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should create the correct components', () => {
    expect(spectator.query(DashboardComponent)).toBeTruthy();
  });
});
