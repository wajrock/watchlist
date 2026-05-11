import {
    EnvironmentInjector,
    inject,
    Injectable,
    runInInjectionContext,
    signal,
} from '@angular/core';
import { AuthService } from './auth.service';
import {
    collection,
    collectionData,
    doc,
    docData,
    documentId,
    Firestore,
    query,
    where,
} from '@angular/fire/firestore';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, shareReplay, Observable, combineLatest, map } from 'rxjs';
import {
    ApiMedia,
    EnrichedWatchlist,
    User,
    WatchlistItem,
    WatchlistMediaCollection,
} from '../models';

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
            const q = query(
                collection(this.firestore, 'watchlists'),
                where('members', 'array-contains', user.uid),
            );
            return runInInjectionContext(this.injector, () => {
                return collectionData(q, { idField: 'uidWatchlist' }) as Observable<
                    WatchlistItem[]
                >;
            });
        }),
        shareReplay(1),
    );

    activeWatchlist$ = toObservable(this.activeId).pipe(
        switchMap((id) => {
            if (!id) return of(null);
            return runInInjectionContext(this.injector, () => {
                return docData(doc(this.firestore, `watchlists/${id}`), {
                    idField: 'uidWatchlist',
                }) as Observable<WatchlistItem>;
            });
        }),
        switchMap((watchlist) => {
            if (!watchlist) return of(null);
            console.log(watchlist);

            const allUserIds = [
                ...new Set([
                    ...watchlist.members,
                    ...watchlist.medias?.map((m) => m.addedByUserId),
                ]),
            ];
            const allMediaIds = [...new Set(watchlist.medias.map((m) => m.idMedia))];

            return runInInjectionContext(this.injector, () => {
                const users$ = allUserIds.length
                    ? (collectionData(
                          query(
                              collection(this.firestore, 'users'),
                              where('uid', 'in', allUserIds.slice(0, 30)),
                          ),
                      ) as Observable<User[]>)
                    : of([]);

                const medias$ = allMediaIds.length
                    ? (collectionData(
                          query(
                              collection(this.firestore, 'medias'),
                              where(documentId(), 'in', allMediaIds.slice(0, 30)),
                          ),
                          { idField: 'uidMedia' },
                      ) as Observable<ApiMedia[]>)
                    : of([]);

                return combineLatest([users$, medias$]).pipe(
                    map(([users, medias]) => {
                        const enriched: EnrichedWatchlist = {
                            uidWatchlist: watchlist.uidWatchlist,
                            creationTime: watchlist.creationTime,
                            name: watchlist.name,
                            members: watchlist.members
                                .map((mId) => users.find((u) => u.uid === mId)!)
                                .filter((u) => !!u),

                            medias: watchlist.medias
                                .map((m) => ({
                                    addedByUserId: users.find((u) => u.uid === m.addedByUserId)!,
                                    dateAddedToWatchlist: m.dateAddedToWatchlist,
                                    uidMedia: m.idMedia,
                                    isSeen: m.isSeen,
                                    mediaDetails: medias.find(
                                        (md) => (md as any).uidMedia === m.idMedia,
                                    )!,
                                }))
                                .filter((m) => !!m.mediaDetails),
                        };
                        return enriched;
                    }),
                );
            });
        }),
        shareReplay(1),
    );

    setActiveId(id: string) {
        localStorage.setItem('activeWatchlistId', id);
        this._activeId.set(id);
    }
}
