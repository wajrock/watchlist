import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displaySeasonsNumber'
})
export class DisplaySeasonsNumberPipe implements PipeTransform {

  transform(numberOfSeasons: number): string {
    return `${numberOfSeasons} Saison${numberOfSeasons > 1 ? 's' : ''}`;
  }

}
