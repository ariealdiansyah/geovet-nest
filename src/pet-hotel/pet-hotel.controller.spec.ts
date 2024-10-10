import { Test, TestingModule } from '@nestjs/testing';
import { PetHotelController } from './pet-hotel.controller';
import { PetHotelService } from './pet-hotel.service';

describe('PetHotelController', () => {
  let controller: PetHotelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetHotelController],
      providers: [PetHotelService],
    }).compile();

    controller = module.get<PetHotelController>(PetHotelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
