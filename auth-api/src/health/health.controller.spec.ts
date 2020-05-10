import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
  });

  describe('root', () => {
    it('should return "up"', () => {
      const controller = app.get<HealthController>(HealthController);
      expect(controller.getStatus()).toBe('up');
    });
  });
});
