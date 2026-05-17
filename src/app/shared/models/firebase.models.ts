import { CONTENT_TYPE } from './models';
import { Genre } from './tmdb.models';

export interface User {
    uid: string;
    name: string;
    username: string;
}

export interface WatchlistItem {
    uidWatchlist: string;
    creationTime: string;
    name: string;
    members: Member[];
    medias: WatchlistMediaCollection[];
}

export interface Member {
    id: string;
    invitationAccepted: boolean;
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
    adult: boolean;
    backdropPath: string;
    genres?: Genre[];
    id: number;
    overview: string;
    popularity: number;
    posterPath: string;
    releaseDate: string;
    runtime?: number;
    numberSeason?: number;
    title: string;
    logo?: { path: string; aspect_ratio: number };
    voteAverage: number;
    type: CONTENT_TYPE;
    provider?: string;
    trailer?: string;
}

export interface WatchlistMediaAdd {
    addedByUserId: string;
    isSeen: boolean;
    grade: GRADE;
    dateAddedToWatchlist: string;
}

export interface WatchlistMediaCollection {
    idMedia: string;
    addedByUserId: string;
    isSeen: boolean;
    grade: GRADE;
    dateAddedToWatchlist: string;
}

export interface EnrichedWatchlist {
    uidWatchlist: string;
    creationTime: string;
    name: string;
    members: EnrichedMember[];
    medias: EnrichedMedia[];
}

export interface EnrichedMember {
    uid: string;
    name: string;
    username: string;
    invitationAccepted: boolean;
}

export interface EnrichedMedia {
    addedByUser: User;
    dateAddedToWatchlist: string;
    uidMedia: string;
    isSeen: boolean;
    grade: GRADE;
    mediaDetails: ApiMedia;
}

export enum GRADE {
    LOVE = 3,
    LIKE = 2,
    DONT_LIKE = 1,
    NO_GRADE = 0,
}
