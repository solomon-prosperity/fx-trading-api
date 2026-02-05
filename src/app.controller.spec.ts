import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the welcome message with API documentation link and environment info', () => {
      const expectedResponse = {
        message: 'Welcome to FX Trading API',
        response: {
          docs: '/api-docs',
          env: 'test',
        },
      };
      expect(appController.getHello()).toEqual(expectedResponse);
    });
  });
});
