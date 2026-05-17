import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWatchlistPopupComponent } from './new-watchlist-popup.component';

describe('NewWatchlistPopupComponent', () => {
  let component: NewWatchlistPopupComponent;
  let fixture: ComponentFixture<NewWatchlistPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewWatchlistPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewWatchlistPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
