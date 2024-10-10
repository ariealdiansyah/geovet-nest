import { Test, TestingModule } from '@nestjs/testing';
import { GroomingService } from './grooming.service';

describe('GroomingService', () => {
  let service: GroomingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroomingService],
    }).compile();

    service = module.get<GroomingService>(GroomingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
