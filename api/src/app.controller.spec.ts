import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      // Arrange
      jest.spyOn(appService, 'getDefaultResponse').mockReturnValue('healthy');
      
      // Act
      const result = appController.healthCheck();
      
      // Assert
      expect(result).toEqual({ status: 'healthy' });
      expect(appService.getDefaultResponse).toHaveBeenCalled();
    });
  });
});