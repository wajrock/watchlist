import { EnrichedMedia, ApiMedia } from '../models/firebase.models';
import { CardInfo, CONTENT_TYPE } from '../models/models';
import {
    ImageObject,
    Images,
    MovieDetails,
    SearchMovieDetails,
    SearchTvDetails,
    TvDetails,
    VideoObject,
} from '../models/tmdb.models';

export function isEnriched(data: CardInfo): data is EnrichedMedia {
    return (data as EnrichedMedia).mediaDetails !== undefined;
}

export function extractBestLogo(
    images: Images,
): { path: string; aspect_ratio: number } | undefined {
    const logos = images.logos;

    if (!logos || logos.length === 0) return undefined;

    const sortByVotes = (a: ImageObject, b: ImageObject) => b.vote_count - a.vote_count;

    let bestLogo = logos.filter((l) => l.iso_639_1 === 'fr').sort(sortByVotes)[0];

    if (!bestLogo) {
        bestLogo = logos.filter((l) => l.iso_639_1 === 'en').sort(sortByVotes)[0];
    }

    if (!bestLogo) {
        bestLogo = [...logos].sort(sortByVotes)[0];
    }

    return {
        path: bestLogo.file_path,
        aspect_ratio: bestLogo.aspect_ratio,
    };
}

export function getBestTrailer(videos: VideoObject[]): string | undefined {
    if (videos.length === 0) return undefined;
    const ytVideos = videos.filter((video) => video.site === 'YouTube');

    const findVideoBy = (type: string, lang: string, official: boolean) =>
        ytVideos.find((v) => v.type === type && v.iso_639_1 === lang && v.official === official)
            ?.key;
    return (
        findVideoBy('Trailer', 'fr', true) ||
        findVideoBy('Trailer', 'en', true) ||
        findVideoBy('Trailer', 'fr', false) ||
        ytVideos.find((v) => v.type === 'Trailer')?.key ||
        ytVideos.find((v) => v.official)?.key ||
        ytVideos[0].key
    );
}
export function mapSearchToApiMedia(
    item: SearchMovieDetails | SearchTvDetails,
    type: CONTENT_TYPE,
): ApiMedia {
    return {
        adult: item.adult,
        id: item.id,
        overview: item.overview,
        title: (item as SearchMovieDetails).title || (item as SearchTvDetails).name,
        backdropPath: item.backdrop_path,
        posterPath: item.poster_path,
        releaseDate:
            (item as SearchMovieDetails).release_date ||
            (item as SearchTvDetails).first_air_date ||
            '',
        voteAverage: item.vote_average,
        popularity: item.popularity,
        type: type,
    };
}
export function mapDetailsToApiMedia(item: MovieDetails | TvDetails, type: CONTENT_TYPE): ApiMedia {
    const movie = item as MovieDetails;
    const tv = item as TvDetails;

    return {
        id: item.id,
        type: type,
        title: movie.title || tv.name || '',
        releaseDate: movie.release_date || tv.first_air_date || '',
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        overview: item.overview,
        voteAverage: item.vote_average,
        adult: item.adult,
        popularity: item.popularity,
        genres: item.genres,
        ...(movie.runtime !== undefined && { runtime: movie.runtime }),
        ...(tv.number_of_seasons !== undefined && { numberSeason: tv.number_of_seasons }),
    };
}
