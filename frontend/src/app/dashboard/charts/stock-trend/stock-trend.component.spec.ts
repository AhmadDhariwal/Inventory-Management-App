import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTrendComponent } from './stock-trend.component';

describe('StockTrendComponent', () => {
  let component: StockTrendComponent;
  let fixture: ComponentFixture<StockTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
