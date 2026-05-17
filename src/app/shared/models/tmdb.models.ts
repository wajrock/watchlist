export interface Search {
    page: number;
    results: (SearchMovieDetails | SearchTvDetails)[];
}

export interface SearchMovieDetails {
    adult: boolean;
    backdrop_path: string;
    id: number;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    vote_average: number;
    vote_count: number;
}

export interface SearchTvDetails {
    adult: boolean;
    backdrop_path: string;
    id: number;
    overview: string;
    popularity: number;
    poster_path: string;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
}

export interface MovieDetails {
    adult: boolean;
    backdrop_path: string;
    genres: Genre[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    runtime: number;
    title: string;
    vote_average: number;
}

export interface TvDetails {
    adult: boolean;
    backdrop_path: string;
    first_air_date: string;
    genres: Genre[];
    id: number;
    name: string;
    number_of_episodes: number;
    number_of_seasons: number;
    original_language: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Trendings {
    page: string;
    results: (MovieDetails | TvDetails)[];
}

export interface Images {
    id: number;
    backdrops: ImageObject[];
    logos: ImageObject[];
    posters: ImageObject[];
}

export interface ImageObject {
    aspect_ratio: number;
    file_path: string;
    height: number;
    iso_639_1: string;
    iso_3166_1: string;
    vote_average: number;
    vote_count: number;
    width: number;
}

export interface Videos {
    id: number;
    results: VideoObject[];
}

export interface VideoObject {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    official: true;
    published_at: string;
    site: string;
    size: number;
    type: string;
}
