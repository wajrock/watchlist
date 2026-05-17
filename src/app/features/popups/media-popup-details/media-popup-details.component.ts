import { Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of, map, switchMap } from 'rxjs';
import { GRADE, WatchlistMediaAdd } from '../../../shared/models/firebase.models';
import {
    CONTENT_TYPE,
    PAGE_VIEW_TYPE,
    CardInfo,
    ACTIONS_VIEW,
} from '../../../shared/models/models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { TmdbService } from '../../../shared/services/tmdb/tmdb.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { isEnriched } from '../../../shared/utils/media.utils';
import { MediaLogoComponent } from './media-logo/media-logo.component';
import { MediaTagsComponent } from './media-tags/media-tags.component';
import { MediaActionsComponent } from './media-actions/media-actions.component';
import { MediaInfosComponent } from './media-infos/media-infos.component';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { TrailerComponent } from '../trailer/trailer.component';

@Component({
    selector: 'app-media-popup-details',
    imports: [
        PopupComponent,
        MediaLogoComponent,
        MediaTagsComponent,
        MediaActionsComponent,
        MediaInfosComponent,
        TrailerComponent,
    ],
    templateUrl: './media-popup-details.component.html',
    styleUrl: './media-popup-details.component.scss',
})
export class MediaPopupDetailsComponent {
    // CONSTANTS
    readonly CONTENT_TYPE = CONTENT_TYPE;
    readonly PAGE_VIEW_TYPE = PAGE_VIEW_TYPE;
    readonly IMG_BASE_URL = 'https://image.tmdb.org/t/p';
    readonly GRADE = GRADE;

    // INJECTS
    private authService = inject(AuthService);
    private tmdbService = inject(TmdbService);
    private collectionService = inject(CollectionService);
    private usersService = inject(UsersService);
    private watchlistService = inject(WatchlistService);
    private toastService = inject(ToastService);

    // INPUTS
    itemInfos = input<CardInfo | null>(null);
    contentType = input.required<CONTENT_TYPE>();
    view = input.required<PAGE_VIEW_TYPE>();
    animatePopup = input<boolean>(true);

    // OUTPUTS
    addedToCollection = output<void>();
    removedFromCollection = output<void>();
    updating = output<void>();
    close = output<void>();

    // COMPUTED
    mediaDetailsResource = rxResource({
        request: () => ({ info: this.itemInfos(), view: this.view() }),
        loader: ({ request }) => {
            const { info, view } = request;
            if (!info) return of(null);

            const baseMedia = isEnriched(info) ? info.mediaDetails : info;

            if (view === PAGE_VIEW_TYPE.SEARCH) {
                return this.tmdbService.getFullContext(baseMedia.id, baseMedia.type);
            }

            return of(baseMedia);
        },
    });

    mediaWatchlistInfo = computed(() => {
        const info = this.itemInfos();
        return info && isEnriched(info) ? info : null;
    });
    mediaDetails = computed(() => this.mediaDetailsResource.value());

    // SIGNALS
    uiStatusChanged = signal<boolean | null>(null);
    uiGradeChanged = signal<GRADE | null>(null);

    readonly mediaSeenStatus = computed<boolean | null>(() => {
        if (this.uiStatusChanged() !== null) {
            return this.uiStatusChanged();
        }

        const mediaWatchlistInfo = this.mediaWatchlistInfo();
        const isSearchView = this.view() === PAGE_VIEW_TYPE.SEARCH;

        if (isSearchView) return false;

        return mediaWatchlistInfo ? mediaWatchlistInfo.isSeen : null;
    });

    mediaGrade = computed<GRADE | null>(() => {
        if (this.uiGradeChanged() !== null) {
            return this.uiGradeChanged();
        }

        const mediaWatchlistInfo = this.mediaWatchlistInfo();

        return mediaWatchlistInfo ? mediaWatchlistInfo.grade : GRADE.NO_GRADE;
    });

    showTrailer = signal<boolean>(false);
    actionsView = signal<ACTIONS_VIEW>(ACTIONS_VIEW.DEFAULT);

    // ASYNC STATE
    ownerName = toSignal(
        toObservable(this.mediaWatchlistInfo).pipe(
            map((watchlist) => watchlist?.addedByUser),
            switchMap((user) => (user ? this.usersService.getUser(user.uid) : of(null))),
            map((user) => user?.name),
        ),
    );
    user = toSignal(this.authService.user$);
    activeWatchlist = toSignal(this.watchlistService.activeWatchlist$);

    activeWatchlistId = computed(() => this.activeWatchlist()?.uidWatchlist ?? null);

    onClose() {
        this.close.emit();
    }

    addToCollection() {
        const activeWatchlistId = this.activeWatchlistId();
        const mediaSeenStatus = this.mediaSeenStatus();
        if (!activeWatchlistId || mediaSeenStatus === null) return;
        const mediaWatchlistInfos: WatchlistMediaAdd = {
            addedByUserId: this.user()!.uid,
            isSeen: mediaSeenStatus,
            grade: GRADE.NO_GRADE,
            dateAddedToWatchlist: new Date().toISOString(),
        };
        this.collectionService
            .addMediaToWatchlist(activeWatchlistId, this.mediaDetails()!, mediaWatchlistInfos)
            .subscribe((response: boolean) => {
                if (response) {
                    this.addedToCollection.emit();
                    this.toastService.show({
                        type: TOAST_TYPE.SUCCESS,
                        message: 'Ajouté à la watchlist',
                    });
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Un problème est survenu',
                    });
                }
            });
    }

    removeFromCollection() {
        const activeWatchlistId = this.activeWatchlistId();
        if (!activeWatchlistId) return;
        this.collectionService
            .removeMediaFromWatchlist(activeWatchlistId, this.mediaWatchlistInfo()?.uidMedia!)
            .subscribe((response) => {
                if (response) {
                    this.removedFromCollection.emit();
                    this.toastService.show({
                        type: TOAST_TYPE.SUCCESS,
                        message: 'Supprimé de la watchlist',
                    });
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Un problème est survenu',
                    });
                }
            });
    }

    changeGrade(grade: GRADE) {
        const currentGrade = this.mediaGrade();

        if (currentGrade === null) {
            return;
        }

        const newGrade = grade !== currentGrade ? grade : GRADE.NO_GRADE;

        const activeWatchlistId = this.activeWatchlistId();
        if (!activeWatchlistId) return;

        this.collectionService
            .updateMediaGrade(activeWatchlistId, this.mediaWatchlistInfo()?.uidMedia!, newGrade)
            .subscribe((response) => {
                if (response) {
                    this.uiGradeChanged.set(newGrade);
                    this.changeActionsView(ACTIONS_VIEW.DEFAULT);
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Un problème est survenu',
                    });
                }
            });
    }

    changeActionsView(view: ACTIONS_VIEW) {
        console.log(view);

        this.actionsView.set(view);
    }

    changeSeenStatus() {
        const currentSeenStatus = this.mediaSeenStatus();

        if (currentSeenStatus === null) return;

        const newStatus = !currentSeenStatus;

        if (this.view() === PAGE_VIEW_TYPE.SEARCH) {
            this.uiStatusChanged.set(newStatus);
            this.addToCollection();
        } else {
            const activeWatchlistId = this.activeWatchlistId();
            if (!activeWatchlistId) return;
            this.collectionService
                .updateMediaSeenStatus(
                    activeWatchlistId,
                    this.mediaWatchlistInfo()?.uidMedia!,
                    newStatus,
                )
                .subscribe((response) => {
                    if (response) {
                        this.uiStatusChanged.set(newStatus);
                    } else {
                        this.toastService.show({
                            type: TOAST_TYPE.ERROR,
                            message: 'Un problème est survenu',
                        });
                    }
                });
        }
    }
}
