import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDetailFuelPricesComponent } from './sidebar-detail-fuel-prices.component';

describe('SidebarDetailFuelPricesComponent', () => {
  let component: SidebarDetailFuelPricesComponent;
  let fixture: ComponentFixture<SidebarDetailFuelPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDetailFuelPricesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarDetailFuelPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
