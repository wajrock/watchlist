import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistMembersPopupComponent } from './watchlist-members-popup.component';

describe('WatchlistMembersPopupComponent', () => {
    let component: WatchlistMembersPopupComponent;
    let fixture: ComponentFixture<WatchlistMembersPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WatchlistMembersPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistMembersPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
