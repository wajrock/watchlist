import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { CONTENT_TYPE, PROFILE_SECTION_VIEW } from '../../../shared/models/models';
import { InvitationComponent } from './invitation/invitation.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { mapDetailsToApiMedia } from '../../../shared/utils/media.utils';
import { ApiMedia, GRADE, User } from '../../../shared/models/firebase.models';
import { documentId } from '@angular/fire/firestore';

@Component({
    selector: 'app-profile',
    imports: [ButtonComponent, AvatarComponent, InvitationComponent, CardComponent],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
})
export class ProfileComponent {
    readonly PROFILE_SECTION_VIEW = PROFILE_SECTION_VIEW;
    readonly GRADE = GRADE;
    readonly CONTENT_TYPE = CONTENT_TYPE;

    private router = inject(Router);
    private authService = inject(AuthService);
    private watchlistService = inject(WatchlistService);
    private collectionService = inject(CollectionService);
    private toastService = inject(ToastService);

    user = toSignal(this.authService.user$);
    watchlistInvitations = toSignal(this.watchlistService.watchlistInvitations$);
    medias = toSignal(
        this.watchlistService.watchlists$.pipe(
            switchMap((watchlists) => {
                const allMediaIds = [
                    ...new Set(watchlists.flatMap((w) => w.medias.map((m) => m.idMedia))),
                ];
                const allMemberIds = [
                    ...new Set(watchlists.flatMap((w) => w.members.map((m) => m.id))),
                ];

                if (allMediaIds.length === 0) return of([]);

                return combineLatest([
                    this.watchlistService.getCollectionByIds<User>('users', 'uid', allMemberIds),
                    this.watchlistService.getCollectionByIds<ApiMedia>(
                        'medias',
                        documentId(),
                        allMediaIds,
                        'uidMedia',
                    ),
                ]).pipe(
                    map(([users, mediasData]) => {
                        const enrichedLists = watchlists.map((watchlist) =>
                            this.watchlistService.enrichWatchlist(watchlist, users, mediasData),
                        );
                        const allEnrichedMedias = enrichedLists.flatMap((w) => w.medias);

                        return allEnrichedMedias;
                    }),
                );
            }),
        ),
    );
    movieMediasCount = computed(
        () =>
            this.medias()?.filter((media) => media.mediaDetails.type === CONTENT_TYPE.MOVIE).length,
    );
    seriesMediasCount = computed(
        () => this.medias()?.filter((media) => media.mediaDetails.type === CONTENT_TYPE.TV).length,
    );
    likeMediasCount = computed(
        () => this.medias()?.filter((media) => media.grade === GRADE.LIKE).length,
    );
    loveMediasCount = computed(
        () => this.medias()?.filter((media) => media.grade === GRADE.LOVE).length,
    );

    view = signal<PROFILE_SECTION_VIEW | null>(null);

    activeView = computed(() => {
        if (this.view()) return this.view();

        const watchlistInvitations = this.watchlistInvitations();

        if (watchlistInvitations && watchlistInvitations.length > 0) {
            return PROFILE_SECTION_VIEW.INVITATIONS;
        }

        return PROFILE_SECTION_VIEW.HISTORY;
    });

    historyFilter = signal<CONTENT_TYPE | GRADE>(CONTENT_TYPE.MOVIE);

    goBack(): void {
        this.router.navigate(['/'], { replaceUrl: true });
    }

    async logOut() {
        await this.authService.logout();
        this.router.navigate(['/welcome'], { replaceUrl: true });
    }

    handleInvitation(watchlistId: string, joinWatchlist: boolean) {
        const user = this.user();
        if (!user) {
            this.toastService.show({ type: TOAST_TYPE.ERROR, message: 'Un problème est survenu' });
            return;
        }
        this.collectionService
            .updateMemberInvitation(watchlistId, user.uid, joinWatchlist)
            .subscribe((response) => {
                if (response) {
                    if (joinWatchlist) {
                        this.toastService.show({
                            type: TOAST_TYPE.SUCCESS,
                            message: 'Invitation acceptée',
                        });
                    } else {
                        this.toastService.show({
                            type: TOAST_TYPE.SUCCESS,
                            message: 'Invitation refusée',
                        });
                    }
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Un problème est survenu',
                    });
                }
                return;
            });
    }
}
