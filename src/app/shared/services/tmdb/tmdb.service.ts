import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiMedia } from '../../models/firebase.models';
import { CONTENT_TYPE } from '../../models/models';
import {
    Images,
    MovieDetails,
    Search,
    Trendings,
    TvDetails,
    Videos,
} from '../../models/tmdb.models';
import { extractBestLogo, getBestTrailer, mapDetailsToApiMedia } from '../../utils/media.utils';

@Injectable({
    providedIn: 'root',
})
export class TmdbService {
    private http = inject(HttpClient);
    private baseUrl = 'https://api.themoviedb.org/3';

    search(contentType: CONTENT_TYPE, searchValue: string): Observable<Search> {
        return this.http.get<Search>(
            `${this.baseUrl}/search/${contentType}?query=${searchValue}&include_adult=false&language=fr-FR&page=1`,
        );
    }

    getFullContext(id: number, type: CONTENT_TYPE): Observable<ApiMedia> {
        return forkJoin({
            details: this.getItemDetails(id, type),
            images: this.getItemImages(id, type),
            providers: this.getItemProviders(id, type),
            videosFR: this.getItemVideos(id, type, 'fr-FR'),
            videoEN: this.getItemVideos(id, type, 'en-EN'),
        }).pipe(
            map(({ details, images, providers, videosFR, videoEN }) => {
                const media = mapDetailsToApiMedia(details, type);
                const bestLogo = extractBestLogo(images);
                if (bestLogo) {
                    media.logo = bestLogo;
                }

                const flatrate = providers.results?.['FR']?.flatrate;
                if (flatrate && flatrate.length > 0) {
                    media.provider = flatrate[0].provider_name;
                }

                const allVideos = [...videosFR.results, ...videoEN.results];

                if (type === CONTENT_TYPE.MOVIE) {
                    const key = getBestTrailer(allVideos);
                    if (key) {
                        media.trailer = key;
                    }
                }

                if (type === CONTENT_TYPE.TV) {
                    const key = getBestTrailer(allVideos);
                    if (key) {
                        media.trailer = key;
                    }
                }

                return media;
            }),
        );
    }

    getTrendings(type: CONTENT_TYPE): Observable<Trendings> {
        return this.http.get<Trendings>(`${this.baseUrl}/trending/${type}/day?language=fr-FR`);
    }

    getItemProviders(id: number, type: CONTENT_TYPE): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${type}/${id}/watch/providers`);
    }

    getItemDetails(id: number, contentType: CONTENT_TYPE): Observable<MovieDetails | TvDetails> {
        return this.http.get<MovieDetails | TvDetails>(
            `${this.baseUrl}/${contentType}/${id}?language=fr-FR`,
        );
    }

    getItemImages(id: number, contentType: CONTENT_TYPE): Observable<Images> {
        return this.http.get<Images>(`${this.baseUrl}/${contentType}/${id}/images`);
    }

    getItemVideos(id: number, contentType: CONTENT_TYPE, lang: string): Observable<Videos> {
        return this.http.get<Videos>(
            `${this.baseUrl}/${contentType}/${id}/videos?language=${lang}`,
        );
    }
}
