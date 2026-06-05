import { DisplayRatePipe } from './display-rate.pipe';

describe('DisplayRatePipe', () => {
    let pipe: DisplayRatePipe;

    beforeEach(() => {
        pipe = new DisplayRatePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should divide the rating by 2 and format it with one decimal place', () => {
        const rawRate = 7.5;
        const result = pipe.transform(rawRate);

        expect(result).toBe('3.8');
    });

    it('should correctly format integer results with a trailing .0 decimal', () => {
        const rawRate = 8;
        const result = pipe.transform(rawRate);

        expect(result).toBe('4.0');
    });

    it('should handle zero correctly', () => {
        const result = pipe.transform(0);
        expect(result).toBe('0.0');
    });
});
