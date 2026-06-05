import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistsPopupComponent } from './watchlists-popup.component';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { Router } from '@angular/router';
import { WatchlistMembersCountPipe } from '../../../shared/pipes/watchlist-members-count.pipe';
import { Subject, of } from 'rxjs';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { Component } from '@angular/core';

@Component({
    selector: 'app-watchlists-popup-mock',
    template: '',
    standalone: true,
})
class WatchlistsPopupMockComponent extends WatchlistsPopupComponent {}

describe('WatchlistsPopupComponent', () => {
    let component: WatchlistsPopupComponent;
    let fixture: ComponentFixture<WatchlistsPopupMockComponent>;

    let mockWatchlistService: any;
    let mockCollectionService: any;
    let mockToastService: any;
    let mockRouter: any;
    let mockPipe: any;

    let activeWatchlistSubject$: Subject<any>;
    let deleteWatchlistSubject$: Subject<any>;

    const mockWatchlistsArray = [
        { uidWatchlist: 'w-1', name: 'Movies', members: [] },
        { uidWatchlist: 'w-2', name: 'Series', members: [] },
    ];

    beforeEach(async () => {
        activeWatchlistSubject$ = new Subject();
        deleteWatchlistSubject$ = new Subject();

        mockWatchlistService = {
            activeWatchlist$: activeWatchlistSubject$.asObservable(),
            setActiveId: vi.fn(),
            deleteWatchlist: vi.fn(() => deleteWatchlistSubject$.asObservable()),
        };
        mockCollectionService = {};
        mockToastService = { show: vi.fn() };
        mockRouter = { navigate: vi.fn() };
        mockPipe = { transform: vi.fn(() => '0 membres') };

        await TestBed.configureTestingModule({
            imports: [WatchlistsPopupMockComponent],
            providers: [
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: CollectionService, useValue: mockCollectionService },
                { provide: ToastService, useValue: mockToastService },
                { provide: Router, useValue: mockRouter },
                { provide: WatchlistMembersCountPipe, useValue: mockPipe },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WatchlistsPopupMockComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('watchlists', mockWatchlistsArray);
        fixture.detectChanges();
    });

    it('should create and populate standard configurations', () => {
        expect(component).toBeTruthy();
    });

    describe('createWatchlist interactive event emitters', () => {
        it('should bubble createNewWatchlist and close signals up to parent containers', () => {
            const createSpy = vi.spyOn(component.createNewWatchlist, 'emit');
            const closeSpy = vi.spyOn(component.close, 'emit');

            component.createWatchlist();

            expect(createSpy).toHaveBeenCalled();
            expect(closeSpy).toHaveBeenCalled();
        });
    });

    describe('selectWatchlist orchestration workflows', () => {
        it('should dispatch workspace selection mappings and close modal windows upon execution', () => {
            const closeSpy = vi.spyOn(component.close, 'emit');

            component.selectWatchlist('w-2');

            expect(mockWatchlistService.setActiveId).toHaveBeenCalledWith('w-2');
            expect(closeSpy).toHaveBeenCalled();
        });
    });

    describe('removeWatchlist data lifecycle operations', () => {
        it('should display error indicators if data deletions fail on infrastructure nodes', () => {
            component.removeWatchlist('w-1');
            deleteWatchlistSubject$.next(false);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Une erreur est survenue',
            });
        });

        it('should send positive toast notifications and exit contexts if network responses return clean true flags', () => {
            const closeSpy = vi.spyOn(component.close, 'emit');

            component.removeWatchlist('w-1');
            deleteWatchlistSubject$.next(true);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Watchlist supprimée',
            });
            expect(closeSpy).toHaveBeenCalled();
        });
    });
});
