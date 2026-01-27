import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySettingsComponent } from './inventory-settings.component';

describe('InventorySettingsComponent', () => {
  let component: InventorySettingsComponent;
  let fixture: ComponentFixture<InventorySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
