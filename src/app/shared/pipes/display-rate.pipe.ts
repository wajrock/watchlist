import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayRate'
})
export class DisplayRatePipe implements PipeTransform {

  transform(rate: number): string {
    return (rate/2).toFixed(1);
  }
}
