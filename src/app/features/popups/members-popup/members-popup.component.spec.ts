import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembersPopupComponent } from './members-popup.component';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { Subject } from 'rxjs';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { Component } from '@angular/core';

@Component({
    selector: 'app-members-popup-mock',
    template: '',
    standalone: true,
})
class MembersPopupMockComponent extends MembersPopupComponent {}

describe('MembersPopupComponent', () => {
    let component: MembersPopupComponent;
    let fixture: ComponentFixture<MembersPopupMockComponent>;

    let mockWatchlistService: any;
    let mockToastService: any;

    let removeMemberSubject$: Subject<boolean>;

    const mockActiveWatchlist = {
        uidWatchlist: 'w-777',
        name: 'Sci-Fi Fans',
        members: [
            { uid: 'u-1', username: 'Alex', invitationAccepted: true },
            { uid: 'u-2', username: 'Jordan', invitationAccepted: false },
        ],
    } as any;

    beforeEach(async () => {
        removeMemberSubject$ = new Subject<boolean>();

        mockWatchlistService = {
            removeMember: vi.fn(() => removeMemberSubject$.asObservable()),
        };
        mockToastService = { show: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [MembersPopupMockComponent],
            providers: [
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: ToastService, useValue: mockToastService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MembersPopupMockComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('activeWatchlist', mockActiveWatchlist);
        fixture.detectChanges();
    });

    it('should create and map target input parameters successfully', () => {
        expect(component).toBeTruthy();
        expect(component.activeWatchlist()).toEqual(mockActiveWatchlist);
    });

    describe('inviteFriendsActions event sequences', () => {
        it('should bubble close and inviteFriends signals synchronously up to parent layouts', () => {
            const closeSpy = vi.spyOn(component.close, 'emit');
            const inviteSpy = vi.spyOn(component.inviteFriends, 'emit');

            component.inviteFriendsActions();

            expect(closeSpy).toHaveBeenCalled();
            expect(inviteSpy).toHaveBeenCalled();
        });
    });

    describe('removeMember data lifecycle pipelines', () => {
        it('should forward parameters to backend service abstraction layer definitions', () => {
            component.removeMember('w-777', 'u-2');
            expect(mockWatchlistService.removeMember).toHaveBeenCalledWith('w-777', 'u-2');
        });

        it('should trigger error notification structures if operations yield false execution codes', () => {
            component.removeMember('w-777', 'u-2');
            removeMemberSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Une erreur est survenue',
            });
        });

        it('should push success notifications and signal close events on clean completions', () => {
            const closeSpy = vi.spyOn(component.close, 'emit');

            component.removeMember('w-777', 'u-2');
            removeMemberSubject$.next(true);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Membre supprimé',
            });
            expect(closeSpy).toHaveBeenCalled();
        });
    });
});
