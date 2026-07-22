import { inject, Injectable } from '@angular/core';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { addDoc, collection, doc } from 'firebase/firestore';
import { defer, map, Observable } from 'rxjs';
import { User } from '../../models/firebase.models';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private firestore = inject(Firestore);

    getUsernames(): Observable<string[]> {
        const usersRef = collection(this.firestore, 'users');
        return (collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>).pipe(
            map((data) => data.map((user) => user.username)),
        );
    }

    getAllUsers(): Observable<User[]> {
        const usersRef = collection(this.firestore, 'users');
        return (collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>).pipe(
            map((data) =>
                data.map((user) => ({
                    uid: user.uid,
                    name: user.name,
                    username: user.username,
                })),
            ),
        );
    }

    addUser(username: string, name: string, password: string): Observable<User> {
        const usersRef = collection(this.firestore, 'users');
        const newUser = { name, username };

        return defer(() => addDoc(usersRef, newUser)).pipe(
            map((docRef) => ({
                uid: docRef.id,
                name,
                username,
            })),
        );
    }

    getUser(userId: string): Observable<User | undefined> {
        const userDocRef = doc(this.firestore, `users/${userId}`);
        return docData(userDocRef, { idField: 'uid' }) as Observable<User | undefined>;
    }

    getLoggedUser(): User | null {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
}
