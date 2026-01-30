import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTodayComponent } from './stock-today.component';

describe('StockTodayComponent', () => {
  let component: StockTodayComponent;
  let fixture: ComponentFixture<StockTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTodayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
