import { ApiMedia, EnrichedMedia } from './firebase.models';

// INTERFACES
export interface ParamOptions {
    id: string;
    value: string;
}

export type CardInfo = ApiMedia | EnrichedMedia;

export enum POPUP {
    WATCHLISTS = 'watchlists',
    NEW_WATCHLIST = 'new-watchlist',
    ITEM_DETAILS = 'item-details',
    MEMBERS = 'members',
    ADD_MEMBERS = 'add-members',
    TRAILER = 'trailer',
}

export enum PAGE_VIEW_TYPE {
    WATCHLIST = 'watchlist',
    SEARCH = 'search',
    TRENDINGS = 'trendings',
}

export enum PROFILE_SECTION_VIEW {
    INVITATIONS = 'invitations',
    HISTORY = 'history',
}

export enum CONTENT_VIEW_TYPE {
    SEEN = 'seen',
    NOT_SEEN = 'not-seen',
}

export enum CONTENT_TYPE {
    MOVIE = 'movie',
    TV = 'tv',
}

export enum NEW_WATCHLIST_VIEW {
    NAME = 'name',
    MEMBERS = 'members',
}

export enum ACTIONS_VIEW {
    GRADES = 'grades',
    DEFAULT = 'default',
}
