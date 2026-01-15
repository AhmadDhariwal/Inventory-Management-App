import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockLevelsComponent } from './stock-levels.component';

describe('StockLevelsComponent', () => {
  let component: StockLevelsComponent;
  let fixture: ComponentFixture<StockLevelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockLevelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
