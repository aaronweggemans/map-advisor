import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppendSidebarDetailComponent } from './append-sidebar-detail.component';

describe('AppendSidebarDetailComponent', () => {
  let component: AppendSidebarDetailComponent;
  let fixture: ComponentFixture<AppendSidebarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppendSidebarDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppendSidebarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
