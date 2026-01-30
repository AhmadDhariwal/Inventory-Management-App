import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPurchasesComponent } from './pending-purchases.component';

describe('PendingPurchasesComponent', () => {
  let component: PendingPurchasesComponent;
  let fixture: ComponentFixture<PendingPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingPurchasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
