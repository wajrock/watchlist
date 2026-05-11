import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logoStyle'
})
export class LogoStylePipe implements PipeTransform {

  transform(aspect_ratio: number): { [key: string]: string } {
    if (aspect_ratio > 5) {
      return {
        'aspect-ratio': aspect_ratio.toString(),
        width: '17rem',
        height: 'auto',
      };
    } else if (aspect_ratio > 2) {
      return {
        'aspect-ratio': aspect_ratio.toString(),
        width: '12rem',
        height: 'auto',
      };
    } else {
      return {
        'aspect-ratio': aspect_ratio.toString(),
        width: 'auto',
        height: '7rem',
      };
    }
  }

}
