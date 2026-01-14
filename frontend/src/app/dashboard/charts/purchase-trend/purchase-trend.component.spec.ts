import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseTrendComponent } from './purchase-trend.component';

describe('PurchaseTrendComponent', () => {
  let component: PurchaseTrendComponent;
  let fixture: ComponentFixture<PurchaseTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
