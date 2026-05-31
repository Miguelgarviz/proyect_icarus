import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game } from '../generated/prisma/client';

describe('GameController', () => {
  let gameController: GameController;
  let gameService: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        {provide: PrismaService,
          useValue: {
            game:{
              
            }
          }
        }
      ]
    }).compile();

    gameService = module.get<GameService>(GameService);
    gameController = module.get<GameController>(GameController);

  });

  describe('getGame', () => {
    it('should return the requested game', async() => {
      const mockGame= {id:1, lobbyId: 1, storeId: 1, round:1, actualPlayerId: 1, supernovaLvL: 1};
      jest.spyOn(gameService, 'getGame').mockResolvedValue(mockGame as Game);
      
      const result = await gameController.getGame("1");
      expect(result).toEqual(mockGame);
      expect(gameService.getGame).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null if the game does not exist', async()=>{
      jest.spyOn(gameService, 'getGame').mockResolvedValue(null);

      const result = await gameController.getGame("999");
      expect(result).toBeNull();
      expect(gameService.getGame).toHaveBeenCalledWith({ id: 999 });
    })
  })
  
});
