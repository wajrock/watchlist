import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideHeart, LucideLogOut, LucideThumbsDown, LucideThumbsUp } from '@lucide/angular';
import { documentId } from 'firebase/firestore';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ApiMedia, GRADE, User } from '../../../shared/models/firebase.models';
import { CONTENT_TYPE, PROFILE_SECTION_VIEW } from '../../../shared/models/models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ScrollService } from '../../../shared/services/scroll/scroll.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { InvitationComponent } from './invitation/invitation.component';

@Component({
    selector: 'app-profile',
    imports: [
        ButtonComponent,
        AvatarComponent,
        InvitationComponent,
        CardComponent,
        LucideLogOut,
        LucideHeart,
        LucideThumbsDown,
        LucideThumbsUp,
    ],
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
    private scrollService = inject(ScrollService);

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
                        return enrichedLists.flatMap((w) => w.medias);
                    }),
                );
            }),
        ),
    );

    movieMediasCount = computed(
        () =>
            this.medias()?.filter((media) => media.mediaDetails.type === CONTENT_TYPE.MOVIE)
                .length ?? 0,
    );
    seriesMediasCount = computed(
        () =>
            this.medias()?.filter((media) => media.mediaDetails.type === CONTENT_TYPE.TV).length ??
            0,
    );
    likeMediasCount = computed(
        () => this.medias()?.filter((media) => media.grade === GRADE.LIKE).length ?? 0,
    );
    loveMediasCount = computed(
        () => this.medias()?.filter((media) => media.grade === GRADE.LOVE).length ?? 0,
    );
    notLikeMediasCount = computed(
        () => this.medias()?.filter((media) => media.grade === GRADE.DONT_LIKE).length ?? 0,
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

    filteredMedias = computed(() => {
        const allMedias = this.medias();
        const filter = this.historyFilter();

        if (!allMedias) return [];

        if (filter === CONTENT_TYPE.MOVIE || filter === CONTENT_TYPE.TV) {
            return allMedias.filter((media) => media.mediaDetails.type === filter);
        } else {
            return allMedias.filter((media) => media.grade === filter);
        }
    });

    @ViewChild('profilePage') profilePage!: ElementRef<HTMLDivElement>;

    constructor() {
        this.scrollService.scrollToTop.subscribe((scrollToTop) => {
            if (scrollToTop) {
                this.profilePage.nativeElement.scrollTo(0, 0);
                this.scrollService.shouldScrollToTop.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/'], { replaceUrl: true });
    }

    async logOut() {
        const navigated = await this.router.navigate(['/welcome'], { replaceUrl: true });
        if (navigated) {
            await this.authService.logout();
        }
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
                    this.toastService.show({
                        type: TOAST_TYPE.SUCCESS,
                        message: joinWatchlist ? 'Invitation acceptée' : 'Invitation refusée',
                    });
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Un problème est survenu',
                    });
                }
            });
    }
}
