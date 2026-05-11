import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayRuntime'
})
export class DisplayRuntimePipe implements PipeTransform {

  transform(runtime: number): string {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours > 0){
      return `${hours}h${minutes.toString().padStart(2, '0')}${minutes > 0 ? 'm' : ''}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}m`;
    }
  }

}
