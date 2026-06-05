import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { CONTENT_TYPE, CONTENT_VIEW_TYPE } from '../../models/models';

describe('FilterService', () => {
    let service: FilterService;

    beforeEach(() => {
        const store: Record<string, string> = {};

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            store[key] = value;
        });

        TestBed.configureTestingModule({
            providers: [FilterService],
        });
    });

    it('should initialize with default values when localStorage is empty', () => {
        service = TestBed.inject(FilterService);

        expect(service.contentType()).toBe(CONTENT_TYPE.MOVIE);
        expect(service.contentViewType()).toBe(CONTENT_VIEW_TYPE.NOT_SEEN);
    });

    it('should initialize with values from localStorage if they exist', () => {
        localStorage.setItem('contentType', CONTENT_TYPE.TV);
        localStorage.setItem('contentViewType', CONTENT_VIEW_TYPE.SEEN);

        service = TestBed.inject(FilterService);

        expect(service.contentType()).toBe(CONTENT_TYPE.TV);
        expect(service.contentViewType()).toBe(CONTENT_VIEW_TYPE.SEEN);
    });

    it('should update contentType signal and save to localStorage', () => {
        service = TestBed.inject(FilterService);
        service.setContentType(CONTENT_TYPE.TV);

        expect(service.contentType()).toBe(CONTENT_TYPE.TV);
        expect(localStorage.setItem).toHaveBeenCalledWith('contentType', CONTENT_TYPE.TV);
    });

    it('should update contentViewType signal and save to localStorage', () => {
        service = TestBed.inject(FilterService);
        service.setContentViewType(CONTENT_VIEW_TYPE.SEEN);

        expect(service.contentViewType()).toBe(CONTENT_VIEW_TYPE.SEEN);
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'contentViewType',
            CONTENT_VIEW_TYPE.SEEN,
        );
    });
});
