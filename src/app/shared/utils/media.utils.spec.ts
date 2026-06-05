import {
    isEnriched,
    extractBestLogo,
    getBestTrailer,
    mapSearchToApiMedia,
    mapDetailsToApiMedia,
} from './media.utils';
import { CONTENT_TYPE } from '../models/models';
import {
    Images,
    VideoObject,
    SearchMovieDetails,
    SearchTvDetails,
    MovieDetails,
    TvDetails,
} from '../models/tmdb.models';

describe('Media Utils', () => {
    describe('isEnriched', () => {
        it('should return true if mediaDetails is defined', () => {
            const cardInfo: any = { mediaDetails: {} };
            expect(isEnriched(cardInfo)).toBe(true);
        });

        it('should return false if mediaDetails is undefined', () => {
            const cardInfo: any = {};
            expect(isEnriched(cardInfo)).toBe(false);
        });
    });

    describe('extractBestLogo', () => {
        it('should return undefined if logos array is missing or empty', () => {
            expect(extractBestLogo({ logos: [] } as unknown as Images)).toBeUndefined();
            expect(extractBestLogo({} as unknown as Images)).toBeUndefined();
        });

        it('should prioritize french logo sorted by vote count', () => {
            const mockImages: any = {
                logos: [
                    { file_path: 'en_low.png', iso_639_1: 'en', vote_count: 5, aspect_ratio: 1.5 },
                    { file_path: 'fr_low.png', iso_639_1: 'fr', vote_count: 10, aspect_ratio: 2.0 },
                    {
                        file_path: 'fr_high.png',
                        iso_639_1: 'fr',
                        vote_count: 50,
                        aspect_ratio: 2.5,
                    },
                ],
            };

            const result = extractBestLogo(mockImages);
            expect(result).toEqual({ path: 'fr_high.png', aspect_ratio: 2.5 });
        });

        it('should fallback to english logo if french is unavailable', () => {
            const mockImages: any = {
                logos: [
                    { file_path: 'us_low.png', iso_639_1: 'en', vote_count: 5, aspect_ratio: 1.0 },
                    {
                        file_path: 'us_high.png',
                        iso_639_1: 'en',
                        vote_count: 25,
                        aspect_ratio: 1.8,
                    },
                ],
            };

            const result = extractBestLogo(mockImages);
            expect(result).toEqual({ path: 'us_high.png', aspect_ratio: 1.8 });
        });

        it('should fallback to the first available logo regardless of language if fr and en match are missing', () => {
            const mockImages: any = {
                logos: [
                    { file_path: 'ja.png', iso_639_1: 'ja', vote_count: 5, aspect_ratio: 1.2 },
                    { file_path: 'es.png', iso_639_1: 'es', vote_count: 30, aspect_ratio: 1.4 },
                ],
            };

            const result = extractBestLogo(mockImages);
            expect(result).toEqual({ path: 'es.png', aspect_ratio: 1.4 });
        });
    });

    describe('getBestTrailer', () => {
        it('should return undefined if videos array is completely empty', () => {
            expect(getBestTrailer([])).toBeUndefined();
        });

        it('should filter only YouTube site source references and resolve priority hierarchy chains', () => {
            const videos: VideoObject[] = [
                {
                    key: 'v1',
                    site: 'Vimeo',
                    type: 'Trailer',
                    iso_639_1: 'fr',
                    official: true,
                } as any,
                {
                    key: 'v2',
                    site: 'YouTube',
                    type: 'Teaser',
                    iso_639_1: 'fr',
                    official: true,
                } as any,
            ];
            expect(getBestTrailer(videos)).toBe('v2');
        });

        it('should match direct sequential combinations for targeted criteria matching', () => {
            const findVideoByFR = [
                {
                    key: 'fr_official',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'fr',
                    official: true,
                } as any,
                {
                    key: 'en_official',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'en',
                    official: true,
                } as any,
            ];
            expect(getBestTrailer(findVideoByFR)).toBe('fr_official');

            const findVideoByEN = [
                {
                    key: 'en_official',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'en',
                    official: true,
                } as any,
                {
                    key: 'fr_unofficial',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'fr',
                    official: false,
                } as any,
            ];
            expect(getBestTrailer(findVideoByEN)).toBe('en_official');

            const findVideoByUnofficialFR = [
                {
                    key: 'fr_unofficial',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'fr',
                    official: false,
                } as any,
                {
                    key: 'any_trailer',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'es',
                    official: false,
                } as any,
            ];
            expect(getBestTrailer(findVideoByUnofficialFR)).toBe('fr_unofficial');

            const fallbackAnyTrailer = [
                {
                    key: 'any_trailer',
                    site: 'YouTube',
                    type: 'Trailer',
                    iso_639_1: 'de',
                    official: false,
                } as any,
                {
                    key: 'any_official',
                    site: 'YouTube',
                    type: 'Clip',
                    iso_639_1: 'en',
                    official: true,
                } as any,
            ];
            expect(getBestTrailer(fallbackAnyTrailer)).toBe('any_trailer');

            const fallbackOfficialOnly = [
                {
                    key: 'any_official',
                    site: 'YouTube',
                    type: 'Clip',
                    iso_639_1: 'en',
                    official: true,
                } as any,
                {
                    key: 'first_raw',
                    site: 'YouTube',
                    type: 'Bloopers',
                    iso_639_1: 'fr',
                    official: false,
                } as any,
            ];
            expect(getBestTrailer(fallbackOfficialOnly)).toBe('any_official');
        });
    });

    describe('mapSearchToApiMedia', () => {
        it('should cleanly structure movie search metrics metadata mapping models', () => {
            const movieItem: SearchMovieDetails = {
                id: 101,
                adult: false,
                overview: 'Movie overview text',
                title: 'Interstellar',
                backdrop_path: '/backdrop.jpg',
                poster_path: '/poster.jpg',
                release_date: '2014-11-07',
                vote_average: 8.6,
                popularity: 150.2,
            } as any;

            const result = mapSearchToApiMedia(movieItem, CONTENT_TYPE.MOVIE);

            expect(result).toEqual({
                id: 101,
                adult: false,
                overview: 'Movie overview text',
                title: 'Interstellar',
                backdropPath: '/backdrop.jpg',
                posterPath: '/poster.jpg',
                releaseDate: '2014-11-07',
                voteAverage: 8.6,
                popularity: 150.2,
                type: CONTENT_TYPE.MOVIE,
            });
        });

        it('should cleanly structure tv search metrics metadata mapping models including empty fallbacks', () => {
            const tvItem: SearchTvDetails = {
                id: 202,
                adult: false,
                overview: 'TV show description',
                name: 'Breaking Bad',
                backdrop_path: '/tv-backdrop.jpg',
                poster_path: '/tv-poster.jpg',
                first_air_date: undefined,
                vote_average: 9.5,
                popularity: 280.4,
            } as any;

            const result = mapSearchToApiMedia(tvItem, CONTENT_TYPE.TV);

            expect(result.title).toBe('Breaking Bad');
            expect(result.releaseDate).toBe('');
            expect(result.type).toBe(CONTENT_TYPE.TV);
        });
    });

    describe('mapDetailsToApiMedia', () => {
        it('should safely extract direct MovieDetails fields including numerical execution metrics like runtime', () => {
            const movieDetails: MovieDetails = {
                id: 303,
                title: 'The Dark Knight',
                release_date: '2008-07-18',
                poster_path: '/dk-poster.jpg',
                backdrop_path: '/dk-backdrop.jpg',
                overview: 'Batman fighting Joker',
                vote_average: 9.0,
                adult: false,
                popularity: 95.5,
                genres: [{ id: 1, name: 'Action' }],
                runtime: 152,
            } as any;

            const result = mapDetailsToApiMedia(movieDetails, CONTENT_TYPE.MOVIE);

            expect(result.runtime).toBe(152);
            expect(result.title).toBe('The Dark Knight');
            expect((result as any).numberSeason).toBeUndefined();
        });

        it('should safely extract direct TvDetails fields including localized trackings like number_of_seasons', () => {
            const tvDetails: TvDetails = {
                id: 404,
                name: 'Sherlock',
                first_air_date: '2010-07-25',
                poster_path: '/sherlock-p.jpg',
                backdrop_path: '/sherlock-b.jpg',
                overview: 'Modern detective story',
                vote_average: 8.8,
                adult: false,
                popularity: 45.2,
                genres: [{ id: 2, name: 'Drama' }],
                number_of_seasons: 4,
            } as any;

            const result = mapDetailsToApiMedia(tvDetails, CONTENT_TYPE.TV);

            expect((result as any).numberSeason).toBe(4);
            expect(result.title).toBe('Sherlock');
            expect((result as any).runtime).toBeUndefined();
        });

        it('should handle unprovided string and missing naming attributes via fallback assignments', () => {
            const invalidDetails: any = {
                id: 505,
                genres: [],
                vote_average: 0,
                adult: false,
                popularity: 0,
            };

            const result = mapDetailsToApiMedia(invalidDetails, CONTENT_TYPE.MOVIE);

            expect(result.title).toBe('');
            expect(result.releaseDate).toBe('');
        });
    });
});
