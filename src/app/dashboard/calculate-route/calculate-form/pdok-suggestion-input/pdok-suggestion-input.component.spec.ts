import { PdokSuggestionInputComponent } from './pdok-suggestion-input.component';
import {createComponentFactory, Spectator} from "@ngneat/spectator";

describe('PdokSuggestionInputComponent', () => {
  let spectator: Spectator<PdokSuggestionInputComponent>;

  const createComponent = createComponentFactory({
    component: PdokSuggestionInputComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
