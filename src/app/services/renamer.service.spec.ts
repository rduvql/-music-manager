import { TestBed } from '@angular/core/testing';

import { RenamerService } from './renamer.service';

describe('RenamerService', () => {
  let service: RenamerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RenamerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
