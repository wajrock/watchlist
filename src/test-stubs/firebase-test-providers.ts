import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

const authMock = {
    onAuthStateChanged: (_auth: any, next: any, _error: any, _complete: any) => {
        if (typeof next === 'function') {
            next(null);
        }
        return () => {};
    },
};

const firestoreMock = {};
const routerMock = {
    navigate: () => Promise.resolve(true),
    url: '',
};

export const firebaseTestProviders = [
    { provide: Auth, useValue: authMock },
    { provide: Firestore, useValue: firestoreMock },
    { provide: Router, useValue: routerMock },
];
