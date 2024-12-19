import { TestBed } from '@angular/core/testing';

import { NpnUsageService } from './npn-usage.service';

describe('NpnUsageService', () => {
  let service: NpnUsageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NpnUsageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
