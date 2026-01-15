import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDetailDrawerComponent } from './stock-detail-drawer.component';

describe('StockDetailDrawerComponent', () => {
  let component: StockDetailDrawerComponent;
  let fixture: ComponentFixture<StockDetailDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDetailDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockDetailDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
