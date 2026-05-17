import { Pipe, PipeTransform } from '@angular/core';
import { Genre } from '../models/tmdb.models';

@Pipe({
    name: 'displayGenre',
})
export class DisplayGenrePipe implements PipeTransform {
    transform(genres: Genre[]): string {
        return genres[0].name.split(' ')[0];
    }
}
