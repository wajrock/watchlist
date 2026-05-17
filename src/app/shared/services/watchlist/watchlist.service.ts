import {
    EnvironmentInjector,
    inject,
    Injectable,
    runInInjectionContext,
    signal,
} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    documentId,
    Firestore,
    getDoc,
    query,
    updateDoc,
    where,
} from '@angular/fire/firestore';
import { toObservable } from '@angular/core/rxjs-interop';
import {
    switchMap,
    of,
    shareReplay,
    Observable,
    combineLatest,
    map,
    catchError,
    from,
    take,
} from 'rxjs';
import {
    WatchlistItem,
    ApiMedia,
    EnrichedWatchlist,
    User,
    Member,
} from '../../models/firebase.models';

@Injectable({
    providedIn: 'root',
})
export class WatchlistService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private injector = inject(EnvironmentInjector);

    private _activeId = signal<string | null>(localStorage.getItem('activeWatchlistId'));
    readonly activeId = this._activeId.asReadonly();

    watchlists$ = this.authService.user$.pipe(
        switchMap((user) => {
            if (!user) return of([]);

            return (
                collectionData(collection(this.firestore, 'watchlists'), {
                    idField: 'uidWatchlist',
                }) as Observable<WatchlistItem[]>
            ).pipe(
                map((lists) =>
                    lists
                        .filter((list) =>
                            list.members.some(
                                (member) => member.id === user.uid && member.invitationAccepted,
                            ),
                        )
                        .sort((a, b) => {
                            return (
                                new Date(b.creationTime).getTime() -
                                new Date(a.creationTime).getTime()
                            );
                        }),
                ),
            );
        }),
        shareReplay(1),
    );

    watchlistInvitations$ = this.authService.user$.pipe(
        switchMap((user) => {
            if (!user) return of([]);

            return (
                collectionData(collection(this.firestore, 'watchlists'), {
                    idField: 'uidWatchlist',
                }) as Observable<WatchlistItem[]>
            ).pipe(
                map((lists) =>
                    lists.filter((list) =>
                        list.members.some(
                            (member) => member.id === user.uid && !member.invitationAccepted,
                        ),
                    ),
                ),
            );
        }),
        shareReplay(1),
    );

    activeWatchlist$ = toObservable(this.activeId).pipe(
        switchMap((id) =>
            id
                ? (docData(doc(this.firestore, `watchlists/${id}`), {
                      idField: 'uidWatchlist',
                  }) as Observable<WatchlistItem>)
                : of(null),
        ),

        switchMap((watchlist) => {
            if (!watchlist) return of(null);

            const userIds = [...new Set(watchlist.members.map((member) => member.id))];
            const mediaIds = [...new Set(watchlist.medias.map((m) => m.idMedia))];

            return combineLatest([
                this.getCollectionByIds<User>('users', 'uid', userIds),
                this.getCollectionByIds<ApiMedia>('medias', documentId(), mediaIds, 'uidMedia'),
            ]).pipe(map(([users, medias]) => this.enrichWatchlist(watchlist, users, medias)));
        }),
        shareReplay(1),
    );

    getCollectionByIds<T>(
        path: string,
        field: string | any,
        ids: string[],
        idField?: string,
    ): Observable<T[]> {
        if (!ids.length) return of([]);
        const q = query(collection(this.firestore, path), where(field, 'in', ids.slice(0, 30)));
        return collectionData(q, idField ? { idField } : undefined) as Observable<T[]>;
    }

    enrichWatchlist(
        watchlist: WatchlistItem,
        users: User[],
        medias: ApiMedia[],
    ): EnrichedWatchlist {
        return {
            ...watchlist,
            members: watchlist.members
                .map((mId) => ({ ...users.find((u) => u.uid === mId.id)!, ...mId }))
                .filter((u) => !!u.uid),

            medias: watchlist.medias
                .map((m) => ({
                    ...m,
                    uidMedia: m.idMedia,
                    addedByUser: users.find((u) => u.uid === m.addedByUserId)!,
                    mediaDetails: medias.find((md) => (md as any).uidMedia === m.idMedia)!,
                }))
                .filter((m) => !!m.mediaDetails && !!m.addedByUserId),
        };
    }

    setActiveId(id: string) {
        localStorage.setItem('activeWatchlistId', id);
        this._activeId.set(id);
    }

    deleteWatchlist(watchlistId: string): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(deleteDoc(watchlistRef)).pipe(
            switchMap(() => this.watchlists$.pipe(take(1))),
            map((lists) => {
                if (this.activeId() === watchlistId) {
                    if (lists.length > 0) {
                        this.setActiveId(lists[0].uidWatchlist);
                    } else {
                        localStorage.removeItem('activeWatchlistId');
                        this._activeId.set(null);
                    }
                }
                return true;
            }),
            catchError((err) => {
                console.error('Erreur lors de la suppression:', err);
                return of(false);
            }),
        );
    }

    removeMember(watchlistId: string, memberId: string): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                const data = snapshot.data() as WatchlistItem;
                if (!snapshot.exists() || !data.medias) return of(false);

                const members = data.members.filter((member) => member.id !== memberId);

                return from(updateDoc(watchlistRef, { members })).pipe(map(() => true));
            }),
            catchError(() => of(false)),
        );
    }

    addNewMembers(watchlistId: string, members: Member[]): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                const data = snapshot.data() as WatchlistItem;
                if (!snapshot.exists() || !data.medias) return of(false);

                const newMembers = [...data.members, ...members];

                return from(updateDoc(watchlistRef, { members: newMembers })).pipe(map(() => true));
            }),
            catchError(() => of(false)),
        );
    }
}
