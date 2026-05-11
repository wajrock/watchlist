import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPopupDetailsComponent } from './item-popup-details.component';

describe('ItemPopupDetailsComponent', () => {
  let component: ItemPopupDetailsComponent;
  let fixture: ComponentFixture<ItemPopupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemPopupDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemPopupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
