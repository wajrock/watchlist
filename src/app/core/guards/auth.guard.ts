import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return authState(auth).pipe(
        filter((user) => user !== undefined),
        take(1),
        map((user) => (user ? true : router.parseUrl('/access'))),
    );
};
