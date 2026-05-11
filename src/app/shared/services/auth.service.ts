import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
    Auth,
    authState,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    user,
} from '@angular/fire/auth';
import {
    collection,
    docData,
    Firestore,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    where,
} from '@angular/fire/firestore';
import { doc } from 'firebase/firestore';
import { Observable, of, shareReplay, switchMap } from 'rxjs';
import { User } from '../models';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private router = inject(Router);
    private injector = inject(EnvironmentInjector);

    private readonly AUTH_DOMAIN = '@watchlist.local';

    user$: Observable<User | null> = authState(this.auth).pipe(
        switchMap((user) => {
            if (user) {
                return runInInjectionContext(this.injector, () => {
                    return docData(doc(this.firestore, `users/${user.uid}`)) as Observable<User>;
                });
            } else {
                return of(null);
            }
        }),
        shareReplay(1),
    );

    async checkUserExists(username: string): Promise<boolean> {
        if (!username) return false;

        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty;
    }

    async signUp(username: string, password: string, name: string) {
        try {
            const technicalEmail = `${username}${this.AUTH_DOMAIN}`;

            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                technicalEmail,
                password,
            );
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            await setDoc(doc(this.firestore, `users/${user.uid}`), {
                uid: user.uid,
                username: username,
                name: name,
            });
        } catch (error) {
            throw error;
        }
    }

    async login(username: string, password: string): Promise<void> {
        const technicalEmail = `${username}${this.AUTH_DOMAIN}`;
        await signInWithEmailAndPassword(this.auth, technicalEmail, password);
    }

    async logout(): Promise<void> {
        await signOut(this.auth);
        localStorage.removeItem('activeWatchlistId');
    }
}
