import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheapFuelStationsComponent } from './cheap-fuel-stations.component';

describe('CheapFuelStationsComponent', () => {
  let component: CheapFuelStationsComponent;
  let fixture: ComponentFixture<CheapFuelStationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheapFuelStationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheapFuelStationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
