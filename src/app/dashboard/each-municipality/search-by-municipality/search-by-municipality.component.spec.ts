import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByMunicipalityComponent } from './search-by-municipality.component';

describe('SearchByMunicipalityComponent', () => {
  let component: SearchByMunicipalityComponent;
  let fixture: ComponentFixture<SearchByMunicipalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchByMunicipalityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchByMunicipalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
