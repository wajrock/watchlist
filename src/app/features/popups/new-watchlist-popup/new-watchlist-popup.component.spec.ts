import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewWatchlistPopupComponent } from './new-watchlist-popup.component';
import { UsersService } from '../../../shared/services/users/users.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { Subject, of } from 'rxjs';
import { NEW_WATCHLIST_VIEW, ParamOptions } from '../../../shared/models/models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { WatchlistItem } from '../../../shared/models/firebase.models';

describe('NewWatchlistPopupComponent', () => {
    let component: NewWatchlistPopupComponent;
    let fixture: ComponentFixture<NewWatchlistPopupComponent>;

    let mockUsersService: any;
    let mockCollectionService: any;
    let mockAuthService: any;
    let mockToastService: any;
    let mockWatchlistService: any;

    let allUsersSubject$: Subject<any>;
    let userSubject$: Subject<any>;
    let watchlistsSubject$: Subject<any>;
    let addWatchlistSubject$: Subject<any>;

    beforeEach(async () => {
        allUsersSubject$ = new Subject();
        userSubject$ = new Subject();
        watchlistsSubject$ = new Subject();
        addWatchlistSubject$ = new Subject();

        mockUsersService = { getAllUsers: vi.fn(() => allUsersSubject$.asObservable()) };
        mockCollectionService = { addWatchlist: vi.fn(() => addWatchlistSubject$.asObservable()) };
        mockAuthService = { user$: userSubject$.asObservable() };
        mockToastService = { show: vi.fn() };
        mockWatchlistService = { watchlists$: watchlistsSubject$.asObservable() };

        await TestBed.configureTestingModule({
            imports: [NewWatchlistPopupComponent],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: CollectionService, useValue: mockCollectionService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: ToastService, useValue: mockToastService },
                { provide: WatchlistService, useValue: mockWatchlistService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NewWatchlistPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with default states', () => {
        expect(component).toBeTruthy();
        expect(component.newWatchlistName()).toBe('');
        expect(component.isMembersListVisible()).toBe(false);
        expect(component.selectedMembers()).toEqual([]);
        expect(component.view()).toBe(NEW_WATCHLIST_VIEW.NAME);
    });

    describe('Computed Signals', () => {
        it('should filter out already selected members from membersOptions', () => {
            allUsersSubject$.next([
                { uid: 'u1', username: 'alice' },
                { uid: 'u2', username: 'bob' },
            ]);
            component.selectedMembers.set([{ id: 'u1', value: 'alice' }]);
            fixture.detectChanges();

            expect(component.membersOptions()).toEqual([{ id: 'u2', value: 'bob' }]);
        });

        it('should compute showCreationButton correctly based on trimmed name value input length', () => {
            component.newWatchlistName.set('   ');
            expect(component.showCreationButton()).toBe(false);

            component.newWatchlistName.set('Marvel Watchlist');
            expect(component.showCreationButton()).toBe(true);
        });
    });

    describe('Interactive Actions', () => {
        it('should update newWatchlistName signal state when triggering text onNameInput changes', () => {
            const mockEvent = { target: { value: 'Sci-Fi Night' } } as unknown as Event;
            component.onNameInput(mockEvent);
            expect(component.newWatchlistName()).toBe('Sci-Fi Night');
        });

        it('should push unique options directly into selectedMembers tracker via addMember', () => {
            const option: ParamOptions = { id: 'u3', value: 'charlie' };
            component.addMember(option);
            expect(component.selectedMembers()).toContain(option);
        });

        it('should splice target selections away from tracking list states via removeMember', () => {
            const item1 = { id: '1', value: 'A' };
            const item2 = { id: '2', value: 'B' };
            component.selectedMembers.set([item1, item2]);

            component.removeMember(item1);
            expect(component.selectedMembers()).toEqual([item2]);
        });
    });

    describe('isWatchlistNameTaken', () => {
        it('should flag true if userWatchlists signal resolution contains null states', () => {
            watchlistsSubject$.next(null);
            expect(component.isWatchlistNameTaken()).toBe(true);
        });

        it('should flag true if watchlist collection matches target criteria name casing', () => {
            watchlistsSubject$.next([{ name: 'Anime' } as WatchlistItem]);
            component.newWatchlistName.set('anime');
            expect(component.isWatchlistNameTaken()).toBe(true);
        });

        it('should flag false if watchlist collection name does not conflict', () => {
            watchlistsSubject$.next([{ name: 'Horror' } as WatchlistItem]);
            component.newWatchlistName.set('Comedy');
            expect(component.isWatchlistNameTaken()).toBe(false);
        });
    });

    describe('createWatchlist', () => {
        it('should block creation workflows and push error toasts if user contexts are empty', () => {
            userSubject$.next(null);
            component.newWatchlistName.set('Valid Name');

            component.createWatchlist();

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Impossible de créer la watchlist',
            });
        });

        it('should block creation workflows and push error toasts if watchlist name formatting fails validations', () => {
            userSubject$.next({ uid: 'current-uid' });
            component.newWatchlistName.set(' ');

            component.createWatchlist();

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Impossible de créer la watchlist',
            });
        });

        it('should push warning validation messages if requested item title is already taken', () => {
            userSubject$.next({ uid: 'current-uid' });
            watchlistsSubject$.next([{ name: 'Duplicate' } as WatchlistItem]);
            component.newWatchlistName.set('Duplicate');

            component.createWatchlist();

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Ce nom est déja utilisé',
            });
        });

        it('should handle subscription returns gracefully and map outputs upon collectionService successes', () => {
            const createdMock: WatchlistItem = {
                uidWatchlist: 'new-id',
                name: 'Action Stuff',
                members: [],
                creationTime: '',
                medias: [],
            };
            const createdSpy = vi.spyOn(component.onWatchlitCreated, 'emit');

            userSubject$.next({ uid: 'current-uid' });
            watchlistsSubject$.next([]);
            component.newWatchlistName.set('Action Stuff');
            component.selectedMembers.set([{ id: 'guest-1', value: 'guest' }]);

            component.createWatchlist();
            addWatchlistSubject$.next(createdMock);

            expect(mockCollectionService.addWatchlist).toHaveBeenCalledWith('Action Stuff', [
                { id: 'current-uid', invitationAccepted: true },
                { id: 'guest-1', invitationAccepted: false },
            ]);
            expect(createdSpy).toHaveBeenCalledWith(createdMock);
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Watchlist créée',
            });
        });

        it('should bypass emitting output references entirely if backend responses map to null values', () => {
            const createdSpy = vi.spyOn(component.onWatchlitCreated, 'emit');

            userSubject$.next({ uid: 'current-uid' });
            watchlistsSubject$.next([]);
            component.newWatchlistName.set('Failing Stream');

            component.createWatchlist();
            addWatchlistSubject$.next(null);

            expect(createdSpy).not.toHaveBeenCalled();
            expect(mockToastService.show).not.toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Watchlist créée',
            });
        });
    });
});
