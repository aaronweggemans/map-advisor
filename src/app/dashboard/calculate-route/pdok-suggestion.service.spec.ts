import { TestBed } from '@angular/core/testing';

import { PdokSuggestionService } from './pdok-suggestion.service';

describe('PdokSuggestionService', () => {
  let service: PdokSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdokSuggestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
