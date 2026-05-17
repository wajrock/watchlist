import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaActionsComponent } from './media-actions.component';

describe('MediaActionsComponent', () => {
  let component: MediaActionsComponent;
  let fixture: ComponentFixture<MediaActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
