import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game } from '../generated/prisma/client';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService,
        {
          provide: PrismaService,
          useValue: {
            game: {
              create: jest.fn(),
            }
          }
        }
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  describe('getGame', () => {
    it('should get a game by its ID', async () => {
      const mockGame= {id:1, lobbyId: 1, storeId: 1, round:1, actualPlayerId: 1, supernovaLvL: 1};
            jest.spyOn(service, 'getGame').mockResolvedValue(mockGame as Game);
            
            const result = await service.getGame({id: 1});
            expect(result).toEqual(mockGame);
            expect(service.getGame).toHaveBeenCalledWith({ id: 1 });
    });
    it('should return null if the game does not exist', async()=>{
      jest.spyOn(service, 'getGame').mockResolvedValue(null);

      const result = await service.getGame({id: 999});
      expect(result).toBeNull();
      expect(service.getGame).toHaveBeenCalledWith({ id: 999 })
    });
  })

  describe('createGame', () => {
    it('should create a new game', async() =>{
      const mockGame = {lobbyId: 1, storeId: null, round: undefined, actualPlayerId: undefined, supernovaLvL: undefined};
      const createdGame = {id: 1, ...mockGame, round: 0, actualPlayerId: null, supernovaLvL: 0, storeId: null};
      
      jest.spyOn(service, 'createGame').mockResolvedValue(createdGame);
      
      const result = await service.createGame(mockGame);
      expect(result).toEqual(createdGame); 
      expect(service.createGame).toHaveBeenCalledWith(mockGame);
    })
    it('should throw an error if the game cannot be created', async() => {
      const mockGame = {lobbyId: 1, storeId: null, round: undefined, actualPlayerId: undefined, supernovaLvL: undefined};
      jest.spyOn(service, 'createGame').mockRejectedValue(new Error('Failed to create game'));

      await expect(service.createGame(mockGame)).rejects.toThrow('Failed to create game');
    })
  })
});
