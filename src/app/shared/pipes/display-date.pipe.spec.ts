import { DisplayDatePipe } from './display-date.pipe';

describe('DisplayDatePipe', () => {
    let pipe: DisplayDatePipe;

    beforeEach(() => {
        pipe = new DisplayDatePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should extract and return only the year from a YYYY-MM-DD date string', () => {
        const rawDate = '2026-06-05';
        const result = pipe.transform(rawDate);

        expect(result).toBe('2026');
    });

    it('should return the original string if it does not contain a hyphen', () => {
        const rawDate = '2026';
        const result = pipe.transform(rawDate);

        expect(result).toBe('2026');
    });
});
