import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendingsComponent } from './trendings.component';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { CONTENT_TYPE } from '../../../shared/models/models';
import { Subject } from 'rxjs';
import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-trendings-mock',
    template: '',
    standalone: true,
})
class TrendingsMockComponent extends TrendingsComponent {}

describe('TrendingsComponent', () => {
    let component: TrendingsComponent;
    let fixture: ComponentFixture<TrendingsMockComponent>;

    let mockFilterService: any;
    let mockWatchlistService: any;
    let mockTmdbService: any;

    let activeWatchlistSubject$: Subject<any>;
    let trendingsSubject$: Subject<any>;
    let contentTypeSignal: any;

    const mockItem = { id: 123, title: 'Trending Movie' } as any;

    beforeEach(async () => {
        activeWatchlistSubject$ = new Subject();
        trendingsSubject$ = new Subject();
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((type) => contentTypeSignal.set(type)),
        };
        mockWatchlistService = {
            activeWatchlist$: activeWatchlistSubject$.asObservable(),
        };
        mockTmdbService = { getTrendings: vi.fn(() => trendingsSubject$.asObservable()) };

        await TestBed.configureTestingModule({
            imports: [TrendingsMockComponent],
            providers: [
                { provide: FilterService, useValue: mockFilterService },
                { provide: TmdbService, useValue: mockTmdbService },
                { provide: WatchlistService, useValue: mockWatchlistService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TrendingsMockComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create with baseline default signals and properties', () => {
        expect(component).toBeTruthy();
        expect(component.selectedInfo()).toBeNull();
        expect(component.showDetailsPopup()).toBe(false);
    });

    describe('switchView layout transitions', () => {
        it('should change content type filters to tv when current state matches movie configurations', () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.TV);
        });

        it('should change content type filters to movie when current state matches tv configurations', () => {
            contentTypeSignal.set(CONTENT_TYPE.TV);
            component.switchView();
            expect(mockFilterService.setContentType).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE);
        });
    });

    describe('handleShowDetails interactive workflows', () => {
        it('should cache designated info payloads and command visibility overlays open', () => {
            component.handleShowDetails(mockItem);
            expect(component.selectedInfo()).toEqual(mockItem);
            expect(component.showDetailsPopup()).toBe(true);
        });
    });

    describe('closeDetailsPopup termination workflows', () => {
        it('should flag visibility parameters off', () => {
            component.showDetailsPopup.set(true);
            component.closeDetailsPopup();

            expect(component.showDetailsPopup()).toBe(false);
        });
    });

    describe('trendingsResource asynchronous loaders', () => {
        it('should query trending endpoints passing selected target categories', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();
            await Promise.resolve();

            expect(mockTmdbService.getTrendings).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE);
        });

        it('should re-query trending endpoints when the content type filter changes', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();
            await Promise.resolve();

            contentTypeSignal.set(CONTENT_TYPE.TV);
            fixture.detectChanges();
            await Promise.resolve();

            expect(mockTmdbService.getTrendings).toHaveBeenCalledWith(CONTENT_TYPE.TV);
        });
    });

    describe('trendingMedias filtering logic', () => {
        it('should return an empty array when trendingsResource has no value yet', () => {
            expect(component.trendingMedias()).toEqual([]);
        });

        it('should return all trending items when activeWatchlist has not emitted yet', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();

            trendingsSubject$.next({
                results: [
                    { id: 1, title: 'Movie A' },
                    { id: 2, title: 'Movie B' },
                ],
            });
            fixture.detectChanges();
            await Promise.resolve();

            expect(component.trendingMedias()?.map((m) => m.id)).toEqual([1, 2]);
        });

        it('should return all trending items when activeWatchlist is null', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();

            trendingsSubject$.next({
                results: [
                    { id: 1, title: 'Movie A' },
                    { id: 2, title: 'Movie B' },
                ],
            });
            activeWatchlistSubject$.next(null);
            fixture.detectChanges();
            await Promise.resolve();

            expect(component.trendingMedias()?.map((m) => m.id)).toEqual([1, 2]);
        });

        it('should filter out trending items already present in the active watchlist', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();

            trendingsSubject$.next({
                results: [
                    { id: 1, title: 'Movie A' },
                    { id: 2, title: 'Movie B' },
                    { id: 3, title: 'Movie C' },
                ],
            });
            activeWatchlistSubject$.next({
                medias: [{ mediaDetails: { id: 2 } }, { mediaDetails: { id: 3 } }],
            });
            fixture.detectChanges();
            await Promise.resolve();

            expect(component.trendingMedias()?.map((m) => m.id)).toEqual([1]);
        });

        it('should return an empty array when every trending item is already in the active watchlist', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();

            trendingsSubject$.next({
                results: [
                    { id: 1, title: 'Movie A' },
                    { id: 2, title: 'Movie B' },
                ],
            });
            activeWatchlistSubject$.next({
                medias: [{ mediaDetails: { id: 1 } }, { mediaDetails: { id: 2 } }],
            });
            fixture.detectChanges();
            await Promise.resolve();

            expect(component.trendingMedias()).toEqual([]);
        });
    });
});
