import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { authServiceStub } from '../../../../test-stubs/service-mocks';
import { firebaseTestProviders } from '../../../../test-stubs/firebase-test-providers';

import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarComponent],
            providers: [
                { provide: AuthService, useValue: authServiceStub },
                {
                    provide: Router,
                    useValue: { navigate: () => Promise.resolve(true), createUrlTree: () => ({}) },
                },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: {}, params: {}, queryParams: {}, url: [] },
                },
                ...firebaseTestProviders,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
