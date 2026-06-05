import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { TOAST_TYPE, Toast } from '../../models/toast.model';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ToastService],
        });
        service = TestBed.inject(ToastService);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should be created with a default null signal', () => {
        expect(service).toBeTruthy();
        expect(service.currentToast()).toBeNull();
    });

    it('should set currentToast and clear it automatically after 3000ms', () => {
        const mockToast: Toast = {
            message: 'Success message',
            type: TOAST_TYPE.SUCCESS,
        };

        service.show(mockToast);

        expect(service.currentToast()).toEqual(mockToast);

        vi.advanceTimersByTime(3000);

        expect(service.currentToast()).toBeNull();
    });
});
