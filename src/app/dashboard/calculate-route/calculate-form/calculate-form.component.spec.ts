import {createComponentFactory, Spectator} from "@ngneat/spectator";
import { CalculateFormComponent } from "./calculate-form.component";

describe('CalculateFormComponent', () => {
  let spectator: Spectator<CalculateFormComponent>;

  const createComponent = createComponentFactory({
    component: CalculateFormComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
