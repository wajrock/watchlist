import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { provideFunctions } from '@angular/fire/functions';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { environment } from '../environments/environments';
import { routes } from './app.routes';
import { tmdbInterceptor } from './core/interceptors/tmdb/tmdb.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withEnabledBlockingInitialNavigation()),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFunctions(() => getFunctions()),
        provideFirestore(() => {
            return initializeFirestore(getApp(), {});
        }),
        provideAuth(() => getAuth()),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([tmdbInterceptor])),
    ],
};
