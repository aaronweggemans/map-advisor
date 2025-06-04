import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTopNavbarComponent } from './map-top-navbar.component';

describe('MapTopNavbarComponent', () => {
  let component: MapTopNavbarComponent;
  let fixture: ComponentFixture<MapTopNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapTopNavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapTopNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
