import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayGenre'
})
export class DisplayGenrePipe implements PipeTransform {

  transform(genre: string): string {
    return genre.split(' ')[0];
  }

}
