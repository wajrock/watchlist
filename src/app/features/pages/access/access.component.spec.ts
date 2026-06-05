import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AccessComponent, ACCESS_VIEW } from './access.component';
import { AuthService } from '../../../shared/services/auth/auth.service';

describe('AccessComponent', () => {
    let component: AccessComponent;
    let fixture: ComponentFixture<AccessComponent>;
    let mockRouter: any;
    let mockAuthService: any;

    beforeEach(async () => {
        mockRouter = {
            navigateByUrl: vi.fn(),
            navigate: vi.fn(),
        };

        mockAuthService = {
            checkUserExists: vi.fn(),
            login: vi.fn(),
            signUp: vi.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [AccessComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create with default initial signals', () => {
        expect(component).toBeTruthy();
        expect(component.view()).toBe(ACCESS_VIEW.DEFAULT);
        expect(component.titlePage()).toBe('Quel est ton identifiant ?');
        expect(component.formErrorMessage()).toBeNull();
    });

    describe('Computed Signals & Input Handlers', () => {
        it('should update username signal and computed conditions', () => {
            expect(component.isUsernameEntered()).toBe(false);

            const event = { target: { value: '  john_doe  ' } } as unknown as Event;
            component.onUsernameInput(event);

            expect(component.username()).toBe('john_doe');
            expect(component.isUsernameEntered()).toBe(true);
            expect(component.formErrorMessage()).toBeNull();
        });

        it('should update password signals and validate if they are identical', () => {
            expect(component.arePasswordsIdentical()).toBe(false);

            component.onPasswordInput({ target: { value: 'password123' } } as unknown as Event);
            component.onConfirmPasswordInput({
                target: { value: 'password123' },
            } as unknown as Event);

            expect(component.isPasswordEntered()).toBe(true);
            expect(component.isConfirmPasswordEntered()).toBe(true);
            expect(component.arePasswordsIdentical()).toBe(true);
        });

        it('should dynamically switch page title based on view signal', () => {
            component.view.set(ACCESS_VIEW.NEW_USER);
            expect(component.titlePage()).toBe('Nouveau ici ? Crée ton compte');

            component.view.set(ACCESS_VIEW.KNOWN_USER);
            expect(component.titlePage()).toBe('Accède à ton compte');
        });
    });

    describe('Navigation', () => {
        it('should navigate back to welcome page on goBack()', () => {
            component.goBack();
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/welcome', { replaceUrl: true });
        });
    });

    describe('Async Logic (checkUsername, login, signup)', () => {
        it('should set view to KNOWN_USER if username exists', async () => {
            mockAuthService.checkUserExists.mockResolvedValue(true);
            component.username.set('existingUser');

            await component.checkUsername();

            expect(component.isNewUser()).toBe(false);
            expect(component.view()).toBe(ACCESS_VIEW.KNOWN_USER);
        });

        it('should set view to NEW_USER if username does not exist', async () => {
            mockAuthService.checkUserExists.mockResolvedValue(false);
            component.username.set('newUser');

            await component.checkUsername();

            expect(component.isNewUser()).toBe(true);
            expect(component.view()).toBe(ACCESS_VIEW.NEW_USER);
        });

        it('should successfully log in and navigate to root page', async () => {
            mockAuthService.login.mockResolvedValue(null);
            component.username.set('user');
            component.password.set('pass');

            await component.login();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
        });

        it('should handle login error with fallback message', async () => {
            mockAuthService.login.mockRejectedValue({
                code: 'auth/invalid-credential',
                message: 'Error',
            });

            await component.login();

            expect(component.formErrorMessage()).toBe('Identifiant ou mot de passe incorrect.');
        });

        it('should handle generic login errors', async () => {
            mockAuthService.login.mockRejectedValue({
                code: 'auth/internal-error',
                message: 'Error',
            });

            await component.login();

            expect(component.formErrorMessage()).toBe('Une erreur technique est survenue.');
        });

        it('should successfully sign up and navigate to root page', async () => {
            mockAuthService.signUp.mockResolvedValue(null);

            await component.signup();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
        });

        it('should handle weak password error on sign up', async () => {
            mockAuthService.signUp.mockRejectedValue({ code: 'auth/weak-password' });

            await component.signup();

            expect(component.formErrorMessage()).toBe('Mot de passe trop faible.');
        });
    });
});
