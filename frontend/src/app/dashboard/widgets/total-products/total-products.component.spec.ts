import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalProductsComponent } from './total-products.component';

describe('TotalProductsComponent', () => {
  let component: TotalProductsComponent;
  let fixture: ComponentFixture<TotalProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
