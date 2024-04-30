import { TestBed } from '@angular/core/testing';

import { CheapFuelStationsService } from './cheap-fuel-stations.service';

describe('CheapFuelStationsService', () => {
  let service: CheapFuelStationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheapFuelStationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
