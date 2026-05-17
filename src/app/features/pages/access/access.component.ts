import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { UsersService } from '../../../shared/services/users/users.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../shared/services/auth/auth.service';

export enum ACCESS_VIEW {
    DEFAULT = 'default',
    NEW_USER = 'newUser',
    KNOWN_USER = 'knownUser',
}
@Component({
    selector: 'app-access',
    imports: [ButtonComponent, InputComponent],
    templateUrl: './access.component.html',
    styleUrl: './access.component.scss',
})
export class AccessComponent {
    // CONSTANTS
    readonly ACCESS_VIEW = ACCESS_VIEW;

    // INJECTS
    private router = inject(Router);
    private authService = inject(AuthService);

    // SIGNALS
    isNewUser = signal<boolean>(false);
    username = signal<string>('');
    name = signal<string>('');
    password = signal<string>('');
    confirmPassword = signal<string>('');
    formErrorMessage = signal<string | null>(null);
    view = signal<ACCESS_VIEW>(ACCESS_VIEW.DEFAULT);

    // COMPUTED
    isUsernameEntered = computed(() => this.username().length > 0);
    isPasswordEntered = computed(() => this.password().length > 0);
    isConfirmPasswordEntered = computed(() => this.confirmPassword().length > 0);
    isNameEntered = computed(() => this.name().length > 0);

    arePasswordsIdentical = computed<boolean>(
        () =>
            this.isPasswordEntered() &&
            this.isConfirmPasswordEntered() &&
            this.password() === this.confirmPassword(),
    );

    titlePage = computed<string>(() => {
        switch (this.view()) {
            case ACCESS_VIEW.NEW_USER:
                return 'Nouveau ici ? Crée ton compte';
            case ACCESS_VIEW.KNOWN_USER:
                return 'Accède à ton compte';
            default:
                return 'Quel est ton identifiant ?';
        }
    });

    // OTHERS
    @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
    @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
    @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
    @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef<HTMLInputElement>;

    onUsernameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.username.set(input.value.trim());
        this.formErrorMessage.set(null);
    }

    onNameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.name.set(input.value.trim());
        this.formErrorMessage.set(null);
    }

    onPasswordInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.password.set(input.value.trim());
        this.formErrorMessage.set(null);
    }

    onConfirmPasswordInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.confirmPassword.set(input.value.trim());
        this.formErrorMessage.set(null);
    }

    goBack(): void {
        this.router.navigateByUrl('/welcome', { replaceUrl: true });
    }

    async checkUsername() {
        const isKnownUser = await this.authService.checkUserExists(this.username());
        if (isKnownUser) {
            this.isNewUser.set(false);
            this.view.set(ACCESS_VIEW.KNOWN_USER);
        } else {
            this.isNewUser.set(true);
            this.view.set(ACCESS_VIEW.NEW_USER);
        }
    }

    async login() {
        try {
            await this.authService.login(this.username(), this.password());
            this.router.navigate(['/'], { replaceUrl: true });
        } catch (error: any) {
            this.formErrorMessage.set(error.message);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                this.formErrorMessage.set('Identifiant ou mot de passe incorrect.');
            } else {
                this.formErrorMessage.set('Une erreur technique est survenue.');
            }
        }
    }

    async signup() {
        try {
            await this.authService.signUp(this.username(), this.password(), this.name());
            this.router.navigate(['/'], { replaceUrl: true });
        } catch (error: any) {
            if (error.code === 'auth/weak-password') {
                this.formErrorMessage.set('Mot de passe trop faible.');
            } else {
                this.formErrorMessage.set('Une erreur technique est survenue.');
            }
        }
    }
}
