import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
    Firestore,
    collection,
    addDoc,
    collectionData,
    deleteDoc,
    doc,
    updateDoc,
    getDocs,
    query,
    where,
    getDoc,
    writeBatch,
    docData,
    deleteField,
    arrayUnion,
} from '@angular/fire/firestore';
import { catchError, combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import {
    ApiMedia,
    CollectionMedia,
    MergedMedia,
    WatchlistItem,
    WatchlistMediaAdd,
    WatchlistMediaCollection,
} from '../models';

@Injectable({
    providedIn: 'root',
})
export class CollectionService {
    private firestore = inject(Firestore);
    private injector = inject(EnvironmentInjector);
    private usersCache: { [id: string]: string } = {};

    getWatchlists(userId: string): Observable<WatchlistItem[]> {
        const watchlistsRef = collection(this.firestore, 'watchlists');
        const q = query(watchlistsRef, where('members', 'array-contains', userId));
        return collectionData(q, { idField: 'id' }) as Observable<WatchlistItem[]>;
    }

    addWatchlist(watchlistName: string, memberIds: string[]): Observable<WatchlistItem> {
        const watchlistsRef = collection(this.firestore, 'watchlists');
        const watchlist = {
            name: watchlistName,
            creationTime: new Date().toISOString(),
            members: memberIds,
            medias: [],
        };
        return from(addDoc(watchlistsRef, watchlist)).pipe(
            map((docRef) => ({
                uidWatchlist: docRef.id,
                creationTime: watchlist.creationTime,
                name: watchlist.name,
                members: watchlist.members,
                medias: watchlist.medias,
            })),
        );
    }

    // async migrateMediasCollection() {
    //     const mediasRef = collection(this.firestore, 'medias');
    //     const snapshot = await getDocs(mediasRef);
    //     const batch = writeBatch(this.firestore);

    //     let count = 0;

    //     snapshot.docs.forEach((doc) => {
    //         const data = doc.data();

    //         // On vérifie si l'ancien champ 'id' existe encore
    //         if (data['id'] !== undefined) {
    //             const docRef = doc.ref;

    //             batch.update(docRef, {
    //                 // On s'assure que apiId prend la valeur de l'ancien id
    //                 apiId: data['id'],
    //                 // On supprime physiquement le champ 'id'
    //                 id: deleteField(),
    //             });
    //             count++;
    //         }
    //     });

    //     if (count > 0) {
    //         await batch.commit();
    //         console.log(`${count} documents mis à jour avec succès.`);
    //     } else {
    //         console.log('Aucun document à migrer.');
    //     }
    // }

    checkIfMediaAlreadyInDB(apiId: number, mediaType: string): Observable<string | null> {
        const filmsRef = collection(this.firestore, 'medias');

        const q = query(filmsRef, where('apiId', '==', apiId), where('type', '==', mediaType));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                if (snapshot.docs.length > 0) {
                    return snapshot.docs[0].id;
                }
                return null;
            }),
        );
    }

    addMediaToWatchlist(
        watchlistId: string,
        apiMedia: ApiMedia,
        mediaWatchlistInfos: WatchlistMediaAdd,
    ): Observable<boolean> {
        const mediasRef = collection(this.firestore, 'medias');
        const watchlistDocRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return this.checkIfMediaAlreadyInDB(apiMedia.apiId, apiMedia.type).pipe(
            switchMap((mediaIdFromCollection) => {
                if (mediaIdFromCollection) {
                    return this.updateWatchlistArray(
                        watchlistDocRef,
                        mediaIdFromCollection,
                        mediaWatchlistInfos,
                    );
                } else {
                    return from(addDoc(mediasRef, apiMedia)).pipe(
                        switchMap((newMediaRef) => {
                            return this.updateWatchlistArray(
                                watchlistDocRef,
                                newMediaRef.id,
                                mediaWatchlistInfos,
                            );
                        }),
                    );
                }
            }),
            map(() => true),
            catchError((error) => {
                console.error("Erreur lors de l'ajout :", error);
                return of(false);
            }),
        );
    }

    private updateWatchlistArray(
        watchlistRef: any,
        mediaId: string,
        infos: WatchlistMediaAdd,
    ): Observable<void> {
        const newEntry: WatchlistMediaCollection = {
            idMedia: mediaId,
            ...infos,
        };

        return from(
            updateDoc(watchlistRef, {
                medias: arrayUnion(newEntry),
            }),
        );
    }

    getWatchlistMedias(watchlistId: string): Observable<MergedMedia[]> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return runInInjectionContext(this.injector, () => {
            return (docData(watchlistRef) as Observable<WatchlistItem | undefined>).pipe(
                switchMap((watchlist: WatchlistItem | undefined) => {
                    if (!watchlist || !watchlist.medias || watchlist.medias.length === 0) {
                        return of([]);
                    }

                    const mediaQueries = watchlist.medias.map((item) => {
                        const mediaRef = doc(this.firestore, `medias/${item.idMedia}`);

                        return runInInjectionContext(this.injector, () => {
                            return (
                                docData(mediaRef) as Observable<CollectionMedia | undefined>
                            ).pipe(
                                map((mediaCollectionInfos) => {
                                    if (!mediaCollectionInfos) return null;
                                    return {
                                        idMedia: item.idMedia,
                                        apiId: mediaCollectionInfos.apiId,
                                        mediaCollectionInfos: mediaCollectionInfos,
                                        mediaWatchlistInfos: item,
                                    };
                                }),
                            );
                        });
                    });

                    return combineLatest(mediaQueries).pipe(
                        map((results) => results.filter((r) => r !== null)),
                    );
                }),
            );
        });
    }

    updateMediaSeenStatus(
        watchlistId: string,
        idMedia: string,
        isSeen: boolean,
    ): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                if (!snapshot.exists()) return of(false);

                const data = snapshot.data() as WatchlistItem;
                const medias = data.medias || [];

                const updatedMedias = medias.map((m) => {
                    if (m.idMedia === idMedia) {
                        return { ...m, isSeen: isSeen };
                    }
                    return m;
                });

                return from(updateDoc(watchlistRef, { medias: updatedMedias })).pipe(
                    map(() => true),
                );
            }),
            catchError((err) => {
                console.error(err);
                return of(false);
            }),
        );
    }

    removeMediaFromWatchlist(watchlistId: string, idMedia: string): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                if (!snapshot.exists()) return of(false);

                const data = snapshot.data() as WatchlistItem;
                const medias = data.medias || [];

                const updatedMedias = medias.filter((m) => m.idMedia !== idMedia);

                return from(updateDoc(watchlistRef, { medias: updatedMedias })).pipe(
                    map(() => true),
                );
            }),
            catchError((err) => {
                console.error('Erreur lors de la suppression :', err);
                return of(false);
            }),
        );
    }

    async updateFilm(id: number, data: Partial<CollectionMedia>) {
        const filmsRef = collection(this.firestore, 'films');
        const q = query(filmsRef, where('id', '==', id));

        const snapshot = await getDocs(q);

        const updates = snapshot.docs.map((docSnap) =>
            updateDoc(doc(this.firestore, 'films', docSnap.id), data),
        );

        return Promise.all(updates);
    }

    async preloadUsers() {
        const snap = await getDocs(collection(this.firestore, 'users'));
        snap.forEach((doc) => {
            this.usersCache[doc.id] = doc.data()['code'];
        });
    }
}
