import { of } from 'rxjs';
import { signal } from '@angular/core';

export const authServiceStub = {
    user$: of(null),
    login: async () => {},
    logout: async () => {},
    checkUserExists: async () => false,
    signUp: async () => {},
};

export const usersServiceStub = {
    getUsernames: () => of([]),
    getAllUsers: () => of([]),
    addUser: async () => ({ uid: '', name: '', username: '' }),
    getUser: () => of(undefined),
    getLoggedUser: () => null,
};

export const watchlistServiceStub = {
    watchlists$: of([]),
    watchlistInvitations$: of([]),
    activeWatchlist$: of(null),
    activeId: of(null),
    addNewMembers: () => of(null),
};

export const tmdbServiceStub = {
    getTrendings: () => of({ results: [] }),
    search: () => of({ results: [] }),
    getFullContext: () => of(null),
};

export const collectionServiceStub = {
    addMediaToWatchlist: () => of(true),
    updateMediaSeenStatus: () => of(true),
    removeMediaFromWatchlist: () => of(true),
    updateMediaGrade: () => of(true),
    addWatchlist: () => of({ uidWatchlist: '', name: '', members: [] }),
};

export const popupServiceStub = {
    close: () => {},
};

export const toastServiceStub = {
    show: () => {},
};

export const filterServiceStub = {
    contentType: signal('movie'),
    contentViewType: signal('not_seen'),
    setContentType: () => {},
    setContentViewType: () => {},
};

export const functionsStub = {};
