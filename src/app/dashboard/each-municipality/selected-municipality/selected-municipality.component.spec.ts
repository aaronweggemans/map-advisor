import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedMunicipalityComponent } from './selected-municipality.component';

describe('SelectedMunicipalityComponent', () => {
  let component: SelectedMunicipalityComponent;
  let fixture: ComponentFixture<SelectedMunicipalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedMunicipalityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedMunicipalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
