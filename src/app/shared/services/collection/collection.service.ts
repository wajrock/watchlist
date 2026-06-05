import { inject, Injectable } from '@angular/core';
import {
    addDoc,
    arrayUnion,
    collection,
    collectionData,
    doc,
    Firestore,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import {
    ApiMedia,
    GRADE,
    Member,
    WatchlistItem,
    WatchlistMediaAdd,
    WatchlistMediaCollection,
} from '../../models/firebase.models';

@Injectable({
    providedIn: 'root',
})
export class CollectionService {
    private firestore = inject(Firestore);

    getWatchlists(userId: string): Observable<WatchlistItem[]> {
        const watchlistsRef = collection(this.firestore, 'watchlists');
        const q = query(watchlistsRef, where('members', 'array-contains', userId));
        return collectionData(q, { idField: 'id' }) as Observable<WatchlistItem[]>;
    }

    addWatchlist(watchlistName: string, members: Member[]): Observable<WatchlistItem> {
        const watchlistsRef = collection(this.firestore, 'watchlists');
        const watchlist = {
            name: watchlistName,
            creationTime: new Date().toISOString(),
            members: members,
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

        return this.checkIfMediaAlreadyInDB(apiMedia.id, apiMedia.type).pipe(
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

    updateMediaSeenStatus(
        watchlistId: string,
        idMedia: string,
        isSeen: boolean,
    ): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                const data = snapshot.data() as WatchlistItem;
                if (!snapshot.exists() || !data.medias) return of(false);

                const medias = data.medias.map((m) =>
                    m.idMedia === idMedia ? { ...m, isSeen } : m,
                );

                return from(updateDoc(watchlistRef, { medias })).pipe(map(() => true));
            }),
            catchError(() => of(false)),
        );
    }

    updateMediaGrade(watchlistId: string, idMedia: string, grade: GRADE): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                const data = snapshot.data() as WatchlistItem;
                if (!snapshot.exists() || !data.medias) return of(false);

                const medias = data.medias.map((m) =>
                    m.idMedia === idMedia ? { ...m, grade: grade } : m,
                );

                return from(updateDoc(watchlistRef, { medias })).pipe(map(() => true));
            }),
            catchError(() => of(false)),
        );
    }

    updateMemberInvitation(
        watchlistId: string,
        idMember: string,
        joinWatchlist: boolean,
    ): Observable<boolean> {
        const watchlistRef = doc(this.firestore, `watchlists/${watchlistId}`);

        return from(getDoc(watchlistRef)).pipe(
            switchMap((snapshot) => {
                const data = snapshot.data() as WatchlistItem;
                if (!snapshot.exists() || !data.medias) return of(false);

                let members: Member[];

                if (joinWatchlist) {
                    members = data.members.map((m) =>
                        m.id === idMember ? { ...m, invitationAccepted: true } : m,
                    );
                } else {
                    members = data.members.filter((m) => m.id !== idMember);
                }

                return from(updateDoc(watchlistRef, { members })).pipe(map(() => true));
            }),
            catchError(() => of(false)),
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
}
