import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideCircleX } from '@lucide/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputDropdownComponent } from '../../../shared/components/input-dropdown/input-dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { Member, WatchlistItem } from '../../../shared/models/firebase.models';
import { NEW_WATCHLIST_VIEW, ParamOptions } from '../../../shared/models/models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CollectionService } from '../../../shared/services/collection/collection.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { formatName } from '../../../shared/utils/string.utils';

@Component({
    selector: 'app-new-watchlist-popup',
    imports: [
        PopupComponent,
        InputComponent,
        InputDropdownComponent,
        ButtonComponent,
        LucideCircleX,
    ],
    templateUrl: './new-watchlist-popup.component.html',
    styleUrl: './new-watchlist-popup.component.scss',
})
export class NewWatchlistPopupComponent {
    // CONSTANTS
    readonly NEW_WATCHLIST_VIEW = NEW_WATCHLIST_VIEW;
    // INJECTS
    private usersService = inject(UsersService);
    private collectionService = inject(CollectionService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private watchlistService = inject(WatchlistService);

    // OUTPUTS
    close = output<void>();
    onWatchlitCreated = output<WatchlistItem>();

    // SIGNALS
    newWatchlistName = signal<string>('');
    isMembersListVisible = signal<boolean>(false);
    selectedMembers = signal<Array<ParamOptions>>([]);
    view = signal<NEW_WATCHLIST_VIEW>(NEW_WATCHLIST_VIEW.NAME);

    // ASYNC STATE
    membersList = toSignal(this.usersService.getAllUsers(), { initialValue: [] });
    user = toSignal(this.authService.user$);
    userWatchlists = toSignal(this.watchlistService.watchlists$, { initialValue: null });

    // COMPUTED
    membersOptions = computed<Array<ParamOptions>>(() => {
        return this.membersList()
            .filter(
                (member) => !this.selectedMembers().some((selected) => selected.id === member.uid),
            )
            .map((user) => ({
                id: user.uid,
                value: user.username,
            }));
    });
    showCreationButton = computed(() => !!formatName(this.newWatchlistName()));

    // METHODS
    onNameInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.newWatchlistName.set(input.value);
    }

    addMember(member: ParamOptions) {
        this.selectedMembers.update((members) => [...members, member]);
    }

    removeMember(member: ParamOptions) {
        this.selectedMembers.update((members) => members.filter((m) => m.id !== member.id));
    }

    createWatchlist() {
        const currentUser = this.user();
        const name = this.newWatchlistName();

        if (!currentUser || !formatName(name)) {
            this.toastService.show({
                type: TOAST_TYPE.ERROR,
                message: 'Impossible de créer la watchlist',
            });
            return;
        }
        if (this.isWatchlistNameTaken()) {
            this.toastService.show({
                type: TOAST_TYPE.ERROR,
                message: 'Ce nom est déja utilisé',
            });
            return;
        }
        const members: Member[] = [
            { id: currentUser.uid, invitationAccepted: true },
            ...this.selectedMembers().map((member) => {
                return { id: member.id, invitationAccepted: false };
            }),
        ];
        const newWatchlist = {
            name: this.newWatchlistName(),
            members: members,
        };

        this.collectionService
            .addWatchlist(newWatchlist.name, newWatchlist.members)
            .subscribe((watchlist) => {
                if (watchlist) {
                    this.onWatchlitCreated.emit(watchlist);
                    this.toastService.show({
                        type: TOAST_TYPE.SUCCESS,
                        message: 'Watchlist créée',
                    });
                }
            });
    }

    isWatchlistNameTaken() {
        if (!this.userWatchlists()) return true;
        return this.userWatchlists()?.some(
            (watchlist) => formatName(watchlist.name) === formatName(this.newWatchlistName()),
        );
    }
}
