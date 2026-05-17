import { Component, computed, inject, input, output, signal } from '@angular/core';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { InputDropdownComponent } from '../../../shared/components/input-dropdown/input-dropdown.component';
import { ParamOptions } from '../../../shared/models/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersService } from '../../../shared/services/users/users.service';
import { EnrichedWatchlist, Member } from '../../../shared/models/firebase.models';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { TOAST_TYPE } from '../../../shared/models/toast.model';

@Component({
    selector: 'app-add-members-popup',
    imports: [PopupComponent, InputDropdownComponent, ButtonComponent],
    templateUrl: './add-members-popup.component.html',
    styleUrl: './add-members-popup.component.scss',
})
export class AddMembersPopupComponent {
    private usersService = inject(UsersService);
    private watchlistService = inject(WatchlistService);
    private toastService = inject(ToastService);
    activeWatchlist = input<EnrichedWatchlist>();
    close = output<void>();
    isMembersListVisible = signal<boolean>(false);
    selectedMembers = signal<Array<ParamOptions>>([]);
    membersList = toSignal(this.usersService.getAllUsers(), { initialValue: [] });
    membersOptions = computed<Array<ParamOptions>>(() => {
        const currentMembers = this.activeWatchlist()!.members;
        const selectedMembers = this.selectedMembers();

        const excludedIds = new Set([
            ...currentMembers.map((m) => m.uid),
            ...selectedMembers.map((s) => s.id),
        ]);

        return this.membersList()
            .filter((member) => !excludedIds.has(member.uid))
            .map((user) => ({
                id: user.uid,
                value: user.username,
            }));
    });

    addMember(member: ParamOptions) {
        this.selectedMembers.update((members) => [...members, member]);
    }

    removeMember(member: ParamOptions) {
        this.selectedMembers.update((members) => members.filter((m) => m.id !== member.id));
    }

    updateMembersList() {
        const activeWatchlist = this.activeWatchlist();

        if (!activeWatchlist) return;

        const members: Member[] = [
            ...this.selectedMembers().map((member) => {
                return { id: member.id, invitationAccepted: false };
            }),
        ];

        this.watchlistService
            .addNewMembers(activeWatchlist.uidWatchlist, members)
            .subscribe((watchlist) => {
                if (watchlist) {
                    this.close.emit();
                    this.toastService.show({
                        type: TOAST_TYPE.SUCCESS,
                        message: 'Amis invités',
                    });
                } else {
                    this.toastService.show({
                        type: TOAST_TYPE.ERROR,
                        message: 'Une erreur est survenue',
                    });
                }
            });
    }
}
