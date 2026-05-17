import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environments';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tmdbInterceptor } from './core/interceptors/tmdb/tmdb.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => {
            return initializeFirestore(getApp(), { localCache: persistentLocalCache() });
        }),
        provideAuth(() => getAuth()),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([tmdbInterceptor])),
    ],
};
