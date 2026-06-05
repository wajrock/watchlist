import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { User } from '../../models/firebase.models';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private firestore = inject(Firestore);

    getUsernames() {
        const usersRef = collection(this.firestore, 'users');
        return (collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>).pipe(
            map((data: User[]) => data.map((user: User) => user.username)),
        );
    }

    getAllUsers(): Observable<User[]> {
        const usersRef = collection(this.firestore, 'users');
        return (collectionData(usersRef, { idField: 'uid' }) as Observable<User[]>).pipe(
            map((data: User[]) =>
                data.map((user: User) => ({
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
        return from(addDoc(usersRef, newUser)).pipe(
            map((docRef) => ({
                uid: docRef.id,
                name,
                username,
            })),
        );
    }

    getUser(userId: string): Observable<User | undefined> {
        const userRef = collection(this.firestore, 'users');
        return (collectionData(userRef, { idField: 'id' }) as Observable<User[]>).pipe(
            map((users: User[]) => users.find((u) => u.uid === userId)),
        );
    }

    getLoggedUser(): User | null {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
}
