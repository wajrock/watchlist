import { DisplayRuntimePipe } from './display-runtime.pipe';

describe('DisplayRuntimePipe', () => {
    let pipe: DisplayRuntimePipe;

    beforeEach(() => {
        pipe = new DisplayRuntimePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should format runtime with hours and padded minutes when runtime is over 60 minutes', () => {
        const result = pipe.transform(125);
        expect(result).toBe('2h05m');
    });

    it('should only format minutes with an "m" suffix when runtime is less than 60 minutes', () => {
        const result = pipe.transform(45);
        expect(result).toBe('45m');
    });

    it('should pad single digit minutes with a leading zero when runtime is less than 60 minutes', () => {
        const result = pipe.transform(5);
        expect(result).toBe('05m');
    });

    it('should not append an extra "m" at the end if minutes are exactly 0', () => {
        const result = pipe.transform(120);
        expect(result).toBe('2h00');
    });
});
