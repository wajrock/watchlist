import { HttpInterceptorFn } from '@angular/common/http';
import { TMDB_API_KEY } from '../../../../environments/environments';

export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.includes('api.themoviedb.org')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },
        });
        return next(authReq);
    }
    return next(req);
};
