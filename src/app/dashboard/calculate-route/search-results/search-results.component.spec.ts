import {createComponentFactory, Spectator} from "@ngneat/spectator";
import { SearchResultsComponent } from "./search-results.component";

describe('SearchResultsComponent', () => {
  let spectator: Spectator<SearchResultsComponent>;

  const createComponent = createComponentFactory({
    component: SearchResultsComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
