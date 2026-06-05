import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, Router, NavigationEnd, provideRouter } from '@angular/router';
import { ToastService } from './shared/services/toast/toast.service';
import { PopupService } from './shared/services/popup/popup.service';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    let mockRouterEvents$: Subject<any>;

    let mockToastService: any;
    let mockPopupService: any;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockRouterEvents$ = new Subject<any>();

        mockToastService = {
            currentToast: vi.fn().mockReturnValue(null),
        };

        mockPopupService = {
            isPopupOpen: vi.fn().mockReturnValue(false),
        };

        mockActivatedRoute = {
            snapshot: { data: { showNavbar: true } },
            firstChild: null,
        };

        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideRouter([]),
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: ToastService, useValue: mockToastService },
                { provide: PopupService, useValue: mockPopupService },
            ],
        }).compileComponents();

        router = TestBed.inject(Router);

        vi.spyOn(router, 'events', 'get').mockReturnValue(mockRouterEvents$.asObservable());

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should create the app with baseline configurations', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.title).toEqual('watch-app');
    });

    describe('Navigation Events & Navbar Visibility Matrix', () => {
        it('should bypass data evaluations if events are not instances of NavigationEnd', () => {
            fixture.detectChanges();
            mockRouterEvents$.next({ id: 99, url: '/dummy' });

            expect(component.showNavbar()).toBe(false);
        });

        it('should map active route configurations and show navbar by default on clean navigation cycle', () => {
            fixture.detectChanges();

            const navigationEndEvent = new NavigationEnd(1, '/dashboard', '/dashboard');
            mockRouterEvents$.next(navigationEndEvent);
            fixture.detectChanges();

            expect(component.showNavbar()).toBe(true);
        });

        it('should traverse nested route structures via firstChild paths to evaluate navbar configurations', () => {
            fixture.detectChanges();

            const mockChildRoute = {
                snapshot: { data: { showNavbar: false } },
                firstChild: null,
            };
            mockActivatedRoute.firstChild = mockChildRoute;

            const navigationEndEvent = new NavigationEnd(2, '/login', '/login');
            mockRouterEvents$.next(navigationEndEvent);
            fixture.detectChanges();

            expect(component.showNavbar()).toBe(false);
        });

        it('should hide navbar if route properties evaluate to true but active popup screens are open', () => {
            fixture.detectChanges();
            mockPopupService.isPopupOpen.mockReturnValue(true);

            const navigationEndEvent = new NavigationEnd(3, '/dashboard', '/dashboard');
            mockRouterEvents$.next(navigationEndEvent);
            fixture.detectChanges();

            expect(component.showNavbar()).toBe(false);
        });
    });
});
