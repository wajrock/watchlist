import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, Router, NavigationEnd, provideRouter } from '@angular/router';
import { ToastService } from './shared/services/toast/toast.service';
import { NavbarService } from './shared/services/navbar/navbar.service';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    let mockRouterEvents$: Subject<any>;

    let mockToastService: any;
    let mockNavbarService: any;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockRouterEvents$ = new Subject<any>();

        mockToastService = {
            currentToast: vi.fn().mockReturnValue(null),
        };

        mockNavbarService = {
            showNavbar: vi.fn().mockReturnValue(true),
            show: vi.fn(),
            hide: vi.fn(),
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
                { provide: NavbarService, useValue: mockNavbarService },
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

    describe('Navigation Events & Navbar Visibility', () => {
        it('should not call show/hide if events are not instances of NavigationEnd', () => {
            fixture.detectChanges();
            mockRouterEvents$.next({ id: 99, url: '/dummy' });

            expect(mockNavbarService.show).not.toHaveBeenCalled();
            expect(mockNavbarService.hide).not.toHaveBeenCalled();
        });

        it('should call show() when route data showNavbar is true', () => {
            fixture.detectChanges();

            const navigationEndEvent = new NavigationEnd(1, '/dashboard', '/dashboard');
            mockRouterEvents$.next(navigationEndEvent);

            expect(mockNavbarService.show).toHaveBeenCalled();
        });

        it('should call hide() when route data showNavbar is false', () => {
            fixture.detectChanges();

            mockActivatedRoute.snapshot.data = { showNavbar: false };

            const navigationEndEvent = new NavigationEnd(2, '/login', '/login');
            mockRouterEvents$.next(navigationEndEvent);

            expect(mockNavbarService.hide).toHaveBeenCalled();
        });

        it('should traverse nested route structures via firstChild to evaluate showNavbar', () => {
            fixture.detectChanges();

            const mockChildRoute = {
                snapshot: { data: { showNavbar: false } },
                firstChild: null,
            };
            mockActivatedRoute.firstChild = mockChildRoute;

            const navigationEndEvent = new NavigationEnd(3, '/login', '/login');
            mockRouterEvents$.next(navigationEndEvent);

            expect(mockNavbarService.hide).toHaveBeenCalled();
        });
    });
});
