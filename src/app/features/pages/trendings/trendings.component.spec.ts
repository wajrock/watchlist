import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendingsComponent } from './trendings.component';
import { FilterService } from '../../../shared/services/filter/filter.service';
import { PopupService } from '../../../shared/services/popup/popup.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { CONTENT_TYPE } from '../../../shared/models/models';
import { Subject, of } from 'rxjs';
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
    let mockPopupService: any;
    let mockTmdbService: any;

    let trendingsSubject$: Subject<any>;
    let contentTypeSignal: any;

    const mockItem = { id: 123, title: 'Trending Movie' } as any;

    beforeEach(async () => {
        trendingsSubject$ = new Subject();
        contentTypeSignal = signal(CONTENT_TYPE.MOVIE);

        mockFilterService = {
            contentType: contentTypeSignal,
            setContentType: vi.fn((type) => contentTypeSignal.set(type)),
        };
        mockPopupService = { close: vi.fn() };
        mockTmdbService = { getTrendings: vi.fn(() => trendingsSubject$.asObservable()) };

        await TestBed.configureTestingModule({
            imports: [TrendingsMockComponent],
            providers: [
                { provide: FilterService, useValue: mockFilterService },
                { provide: PopupService, useValue: mockPopupService },
                { provide: TmdbService, useValue: mockTmdbService },
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
        it('should flag visibility parameters off and communicate actions back to core popup systems', () => {
            component.showDetailsPopup.set(true);
            component.closeDetailsPopup();

            expect(component.showDetailsPopup()).toBe(false);
            expect(mockPopupService.close).toHaveBeenCalled();
        });
    });

    describe('trendingsResource asynchronous loaders', () => {
        it('should query trending endpoints passing selected target categories', async () => {
            contentTypeSignal.set(CONTENT_TYPE.MOVIE);
            fixture.detectChanges();
            await Promise.resolve();

            expect(mockTmdbService.getTrendings).toHaveBeenCalledWith(CONTENT_TYPE.MOVIE);
        });
    });
});
