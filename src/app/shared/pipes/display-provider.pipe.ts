import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayProvider'
})
export class DisplayProviderPipe implements PipeTransform {

  transform(provider: string): string {
    if (provider === 'Inconnu') { 
      return provider
    }

    const shortName = provider.split(' ').splice(0,2).join(' ')
    

    if (provider.includes('Amazon Channel')){
      return shortName.split(' ')[0].replace(' plus', '+').replace(' Plus', '+');
    }

    return shortName.replace(' plus', '+').replace(' Plus', '+');
  }

}
