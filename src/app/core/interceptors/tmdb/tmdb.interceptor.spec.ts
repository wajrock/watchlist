import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { tmdbInterceptor } from './tmdb.interceptor';

describe('tmdbInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([tmdbInterceptor])),
                provideHttpClientTesting(),
            ],
        });

        vi.mock('../../../../environments/environments', () => ({
            TMDB_API_KEY: 'test-tmdb-api-key',
        }));

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when the request URL includes api.themoviedb.org', () => {
        httpClient.get('https://api.themoviedb.org/3/movie/popular').subscribe();

        const req = httpMock.expectOne('https://api.themoviedb.org/3/movie/popular');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer test-tmdb-api-key`);

        req.flush({});
    });

    it('should NOT add Authorization header when the request URL does not include api.themoviedb.org', () => {
        httpClient.get('https://other-api-service.com/data').subscribe();

        const req = httpMock.expectOne('https://other-api-service.com/data');
        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });
});
