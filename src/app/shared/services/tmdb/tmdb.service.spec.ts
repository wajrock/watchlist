import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, firstValueFrom } from 'rxjs';
import { TmdbService } from './tmdb.service';
import { CONTENT_TYPE } from '../../models/models';
import * as mediaUtils from '../../utils/media.utils';

vi.mock('../../utils/media.utils', () => ({
    mapDetailsToApiMedia: vi.fn(),
    extractBestLogo: vi.fn(),
    getBestTrailer: vi.fn(),
}));

describe('TmdbService', () => {
    let service: TmdbService;
    let mockHttpClient: any;

    beforeEach(() => {
        mockHttpClient = {
            get: vi.fn().mockReturnValue(of({})),
        };

        TestBed.configureTestingModule({
            providers: [TmdbService, { provide: HttpClient, useValue: mockHttpClient }],
        });

        service = TestBed.inject(TmdbService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call search API with correct URL format', async () => {
        const mockSearchResponse = { results: [] };
        mockHttpClient.get.mockReturnValue(of(mockSearchResponse));

        const result = await firstValueFrom(service.search(CONTENT_TYPE.MOVIE, 'Inception'));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/search/movie?query=Inception&include_adult=false&language=fr-FR&page=1',
        );
        expect(result).toEqual(mockSearchResponse);
    });

    it('should call getTrendings API with correct URL format', async () => {
        await firstValueFrom(service.getTrendings(CONTENT_TYPE.TV));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/trending/tv/day?language=fr-FR',
        );
    });

    it('should call getItemProviders API with correct URL format', async () => {
        await firstValueFrom(service.getItemProviders(456, CONTENT_TYPE.MOVIE));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/movie/456/watch/providers',
        );
    });

    it('should call getItemDetails API with correct URL format', async () => {
        await firstValueFrom(service.getItemDetails(123, CONTENT_TYPE.MOVIE));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/movie/123?language=fr-FR',
        );
    });

    it('should call getItemImages API with correct URL format', async () => {
        await firstValueFrom(service.getItemImages(123, CONTENT_TYPE.TV));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/tv/123/images',
        );
    });

    it('should call getItemVideos API with correct URL format and language code', async () => {
        await firstValueFrom(service.getItemVideos(123, CONTENT_TYPE.MOVIE, 'en-EN'));

        expect(mockHttpClient.get).toHaveBeenCalledWith(
            'https://api.themoviedb.org/3/movie/123/videos?language=en-EN',
        );
    });

    describe('getFullContext', () => {
        it('should map detailed movie context fields correctly when all options and data exist', async () => {
            const mockMediaInstance: any = { id: 1 };
            vi.mocked(mediaUtils.mapDetailsToApiMedia).mockReturnValue(mockMediaInstance);
            vi.mocked(mediaUtils.extractBestLogo).mockReturnValue({
                path: 'extracted-logo.png',
                aspect_ratio: 2.5,
            } as any);
            vi.mocked(mediaUtils.getBestTrailer).mockReturnValue('trailer-youtube-key');

            mockHttpClient.get.mockImplementation((url: string) => {
                if (url.includes('/watch/providers')) {
                    return of({ results: { FR: { flatrate: [{ provider_name: 'Netflix' }] } } });
                }
                if (url.includes('/videos')) {
                    return of({ results: [{ key: 'vid1' }] });
                }
                return of({});
            });

            const result = await firstValueFrom(service.getFullContext(1, CONTENT_TYPE.MOVIE));

            expect(result.logo).toEqual({ path: 'extracted-logo.png', aspect_ratio: 2.5 });
            expect(result.provider).toBe('Netflix');
            expect(result.trailer).toBe('trailer-youtube-key');
        });

        it('should map detailed TV context fields and bypass missing optional provider or asset details cleanly', async () => {
            const mockMediaInstance: any = { id: 2 };
            vi.mocked(mediaUtils.mapDetailsToApiMedia).mockReturnValue(mockMediaInstance);
            vi.mocked(mediaUtils.extractBestLogo).mockReturnValue(undefined);
            vi.mocked(mediaUtils.getBestTrailer).mockReturnValue(undefined);

            mockHttpClient.get.mockImplementation((url: string) => {
                if (url.includes('/watch/providers')) {
                    return of({ results: { FR: { flatrate: [] } } });
                }
                return of({ results: [] });
            });

            const result = await firstValueFrom(service.getFullContext(2, CONTENT_TYPE.TV));

            expect(result.logo).toBeUndefined();
            expect(result.provider).toBeUndefined();
            expect(result.trailer).toBeUndefined();
        });
    });
});
