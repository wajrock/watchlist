import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPopupDetailsComponent } from './media-popup-details.component';

describe('MediaPopupDetailsComponent', () => {
  let component: MediaPopupDetailsComponent;
  let fixture: ComponentFixture<MediaPopupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaPopupDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaPopupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
