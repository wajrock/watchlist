import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { watchlistGuard } from './watchlist.guard';

describe('watchlistGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => watchlistGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
