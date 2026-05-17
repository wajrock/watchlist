import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistsPopupComponent } from './watchlists-popup.component';

describe('WatchlistsPopupComponent', () => {
  let component: WatchlistsPopupComponent;
  let fixture: ComponentFixture<WatchlistsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchlistsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchlistsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
