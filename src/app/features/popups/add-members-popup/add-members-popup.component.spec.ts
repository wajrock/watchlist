import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMembersPopupComponent } from './add-members-popup.component';
import { UsersService } from '../../../shared/services/users/users.service';
import { WatchlistService } from '../../../shared/services/watchlist/watchlist.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { Subject, of } from 'rxjs';
import { ParamOptions } from '../../../shared/models/models';
import { TOAST_TYPE } from '../../../shared/models/toast.model';
import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-add-members-popup-mock',
    template: '',
    standalone: true,
})
class AddMembersPopupMockComponent extends AddMembersPopupComponent {}

describe('AddMembersPopupComponent', () => {
    let component: AddMembersPopupComponent;
    let fixture: ComponentFixture<AddMembersPopupMockComponent>;

    let mockUsersService: any;
    let mockWatchlistService: any;
    let mockToastService: any;

    let allUsersSubject$: Subject<any>;
    let addNewMembersSubject$: Subject<any>;

    const mockActiveWatchlist = {
        uidWatchlist: 'w-123',
        name: 'Movie Night',
        members: [
            { uid: 'u-owner', username: 'owner', invitationAccepted: true },
            { uid: 'u-existing', username: 'existing', invitationAccepted: false },
        ],
    };

    beforeEach(async () => {
        allUsersSubject$ = new Subject();
        addNewMembersSubject$ = new Subject();

        mockUsersService = { getAllUsers: vi.fn(() => allUsersSubject$.asObservable()) };
        mockWatchlistService = { addNewMembers: vi.fn(() => addNewMembersSubject$.asObservable()) };
        mockToastService = { show: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [AddMembersPopupMockComponent],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: ToastService, useValue: mockToastService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddMembersPopupMockComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('activeWatchlist', mockActiveWatchlist);
        fixture.detectChanges();
    });

    it('should create with default component states', () => {
        expect(component).toBeTruthy();
        expect(component.isMembersListVisible()).toBe(false);
        expect(component.selectedMembers()).toEqual([]);
    });

    describe('membersOptions computed tracking matrix', () => {
        it('should filter out active watchlist members and currently selected list choices', () => {
            allUsersSubject$.next([
                { uid: 'u-owner', username: 'owner' },
                { uid: 'u-existing', username: 'existing' },
                { uid: 'u-candidate1', username: 'candidate1' },
                { uid: 'u-candidate2', username: 'candidate2' },
            ]);
            fixture.detectChanges();

            component.selectedMembers.set([{ id: 'u-candidate1', value: 'candidate1' }]);
            fixture.detectChanges();

            expect(component.membersOptions()).toEqual([
                { id: 'u-candidate2', value: 'candidate2' },
            ]);
        });
    });

    describe('Interactive Target Actions', () => {
        it('should push unique options tracking elements into selectedMembers signal array via addMember', () => {
            const member: ParamOptions = { id: 'u-new', value: 'new-user' };
            component.addMember(member);
            expect(component.selectedMembers()).toContain(member);
        });

        it('should slice target tracker profiles out from chosen lists via removeMember', () => {
            const m1 = { id: '1', value: 'A' };
            const m2 = { id: '2', value: 'B' };
            component.selectedMembers.set([m1, m2]);

            component.removeMember(m1);
            expect(component.selectedMembers()).toEqual([m2]);
        });
    });

    describe('updateMembersList Workflow blocks', () => {
        it('should cancel downstream actions completely if activeWatchlist input is absent', () => {
            fixture.componentRef.setInput('activeWatchlist', undefined);
            fixture.detectChanges();

            component.updateMembersList();
            expect(mockWatchlistService.addNewMembers).not.toHaveBeenCalled();
        });

        it('should dispatch error notification triggers if update calls respond with negative statuses', () => {
            component.selectedMembers.set([{ id: 'u-invited', value: 'invited' }]);
            fixture.detectChanges();

            component.updateMembersList();
            addNewMembersSubject$.next(null);

            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.ERROR,
                message: 'Une erreur est survenue',
            });
        });

        it('should emit termination events and signal successes upon clean database sync operations', () => {
            const closeSpy = vi.spyOn(component.close, 'emit');
            component.selectedMembers.set([{ id: 'u-invited', value: 'invited' }]);
            fixture.detectChanges();

            component.updateMembersList();
            addNewMembersSubject$.next({ uidWatchlist: 'w-123' });

            expect(mockWatchlistService.addNewMembers).toHaveBeenCalledWith('w-123', [
                { id: 'u-invited', invitationAccepted: false },
            ]);
            expect(closeSpy).toHaveBeenCalled();
            expect(mockToastService.show).toHaveBeenCalledWith({
                type: TOAST_TYPE.SUCCESS,
                message: 'Amis invités',
            });
        });
    });
});
