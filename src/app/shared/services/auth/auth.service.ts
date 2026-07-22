import { inject, Injectable, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import {
    collection,
    doc,
    enableNetwork,
    getDocs,
    limit,
    query,
    setDoc,
    where,
} from 'firebase/firestore';
import { Observable, of, shareReplay, switchMap } from 'rxjs';
import { User } from '../../models/firebase.models';

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

        try {
            await enableNetwork(this.firestore);

            const usersRef = collection(this.firestore, 'users');
            const q = query(usersRef, where('username', '==', username), limit(1));
            const querySnapshot = await getDocs(q);

            return !querySnapshot.empty;
        } catch (error) {
            console.error('checkUserExists error:', error);
            throw error;
        }
    }

    async signUp(username: string, password: string, name: string): Promise<void> {
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
