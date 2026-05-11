// INTERFACES
export interface ParamOptions {
    id: string;
    value: string;
}

export interface User {
    uid: string;
    name: string;
    username: string;
}

export interface WatchlistItem {
    uidWatchlist: string;
    creationTime: string;
    name: string;
    members: string[];
    medias: WatchlistMediaCollection[];
}

export interface MergedMedia {
    idMedia: string;
    apiId: number;
    mediaCollectionInfos: CollectionMedia;
    mediaWatchlistInfos?: WatchlistMediaCollection;
}

export interface CollectionMedia {
    idMedia: string;
    apiId: number;
    backdrop_path: string;
    dateAddedToCollection: string;
    original_language: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    genre: string;
    runtime?: number;
    numberSeason?: number;
    first_air_date?: string;
    title: string;
    logo: { path: string; aspect_ratio: number };
    vote_average: number;
    type: CONTENT_TYPE;
    provider?: string;
}

export interface ApiMedia {
    apiId: number;
    backdrop_path: string;
    dateAddedToCollection: string;
    original_language: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    genre: string;
    runtime?: number;
    numberSeason?: number;
    first_air_date?: string;
    title: string;
    logo: { path: string; aspect_ratio: number };
    vote_average: number;
    type: CONTENT_TYPE;
    provider?: string;
}

export interface WatchlistMediaAdd {
    addedByUserId: string;
    isSeen: boolean;
    dateAddedToWatchlist: string;
}

export interface WatchlistMediaCollection {
    idMedia: string;
    addedByUserId: string;
    isSeen: boolean;
    dateAddedToWatchlist: string;
}

export interface API_RESPONSE {
    id: number;
    backdrop_path: string;
    original_language: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    first_air_date?: string;
    title: string;
    name?: string;
    vote_average: number;
}

// CONSTANTS
export enum CONTENT_TYPE {
    MOVIE = 'movie',
    TV = 'tv',
}

export enum VIEW_TYPE {
    SEEN = 'seen',
    NOT_SEEN = 'not-seen',
}

export interface EnrichedWatchlist {
    uidWatchlist: string;
    creationTime: string;
    name: string;
    members: User[];
    medias: EnrichedMedia[];
}

export interface EnrichedMedia {
    addedByUserId: User;
    dateAddedToWatchlist: string;
    uidMedia: string;
    isSeen: boolean;
    mediaDetails: ApiMedia;
}
