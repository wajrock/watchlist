import { DisplayGenrePipe } from './display-genre.pipe';
import { Genre } from '../models/tmdb.models';

describe('DisplayGenrePipe', () => {
    let pipe: DisplayGenrePipe;

    beforeEach(() => {
        pipe = new DisplayGenrePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should extract and return the first word of the first genre name', () => {
        const mockGenres: Genre[] = [
            { id: 1, name: 'Sci-Fi & Fantasy' },
            { id: 2, name: 'Action' },
        ];

        const result = pipe.transform(mockGenres);

        expect(result).toBe('Sci-Fi');
    });

    it('should return the full name if the first genre name has no spaces', () => {
        const mockGenres: Genre[] = [{ id: 3, name: 'Drama' }];

        const result = pipe.transform(mockGenres);

        expect(result).toBe('Drama');
    });
});
