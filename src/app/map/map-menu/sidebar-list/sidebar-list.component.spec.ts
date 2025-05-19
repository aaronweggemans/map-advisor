import { SidebarListComponent } from './sidebar-list.component';
import {createComponentFactory, Spectator} from "@ngneat/spectator";

describe('SidebarListComponent', () => {
  let spectator: Spectator<SidebarListComponent>;

  const createComponent = createComponentFactory({
    component: SidebarListComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
