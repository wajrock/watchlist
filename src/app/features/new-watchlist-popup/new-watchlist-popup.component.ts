import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { PopupComponent } from '../../shared/components/popup/popup.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { InputDropdownComponent } from '../../shared/components/input-dropdown/input-dropdown.component';
import { UsersService } from '../../shared/services/users.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ParamOptions, WatchlistItem } from '../../shared/models';
import { NgClass } from '../../../../node_modules/@angular/common/common_module.d-NEF7UaHr';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CollectionService } from '../../shared/services/collection.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-new-watchlist-popup',
    imports: [PopupComponent, InputComponent, InputDropdownComponent, ButtonComponent],
    templateUrl: './new-watchlist-popup.component.html',
    styleUrl: './new-watchlist-popup.component.scss',
})
export class NewWatchlistPopupComponent {
    private usersService = inject(UsersService);
    private collectionService = inject(CollectionService);
    private authService = inject(AuthService);

    newWatchlistName = signal<string>('');
    isMembersListVisible = signal<boolean>(false);

    membersList = toSignal(this.usersService.getAllUsers(), { initialValue: [] });
    selectedMembers = signal<Array<ParamOptions>>([]);
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
    user = toSignal(this.authService.user$);
    @Output() close = new EventEmitter<WatchlistItem>();

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
        const membersIds = [this.user()!.uid, ...this.selectedMembers().map((member) => member.id)];
        const newWatchlist = {
            name: this.newWatchlistName(),
            members: membersIds,
        };
        this.collectionService
            .addWatchlist(newWatchlist.name, newWatchlist.members)
            .subscribe((watchlist) => {
                if (watchlist) {
                    this.close.emit(watchlist);
                }
            });
    }
}
