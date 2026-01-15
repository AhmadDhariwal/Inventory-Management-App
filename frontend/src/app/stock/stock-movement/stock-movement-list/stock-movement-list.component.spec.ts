import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMovementListComponent } from './stock-movement-list.component';

describe('StockMovementListComponent', () => {
  let component: StockMovementListComponent;
  let fixture: ComponentFixture<StockMovementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockMovementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockMovementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
