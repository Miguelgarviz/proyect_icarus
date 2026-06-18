import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Game, Prisma, PrismaClient } from '../generated/prisma/client';
import { TileService } from '../tile/tile.service';

describe('GameService', () => {
  let service: GameService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService,
        {
          provide: PrismaService,
          useValue: prismaMock
        },
        {
          provide: TileService,
          useValue:{

          }
        }
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('GameService should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGame', () => {
    it('should get a game by its ID', async () => {
      const fakeLobbyId = 999
      const fakeActualPlayerId = 999
      const fakeStoreId = 999

      const mockGame= {
        id:1, 
        lobbyId: fakeLobbyId, 
        storeId: fakeStoreId, 
        round:0, 
        actualPlayerId: fakeActualPlayerId, 
        supernovaLvL: 0
      };
      
      prismaMock.game.findUniqueOrThrow.mockResolvedValue(mockGame)
            
      const result = await service.getGame({id: 1});
      expect(result).toEqual(mockGame);
      expect(prismaMock.game.findUniqueOrThrow).toHaveBeenCalledWith({ 
        where: {id: 1} 
      });
    });
    it('should return PrismaError if the game does not exist', async()=>{
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );

      // 2. Le decimos al mock que RECHACE (lance error) con ese objeto de error
      prismaMock.game.findUniqueOrThrow.mockRejectedValue(prismaError);

      // 3. Comprobamos que el servicio lanza el error al ejecutarlo
      await expect(service.getGame({id: 999})).rejects.toThrow(prismaError);
    });
  })

  describe('createGame', () => {
    it('should create a new game', async() =>{
      const fakeLobbyId = "999"
      const fakeActualPlayerId = "999"
  
      const expectedGameOutput = {
        id:1, 
        lobbyId: 999, 
        storeId: null, 
        round:0, 
        actualPlayerId: 999, 
        supernovaLvL: 0
      };

      const CreateGameInput = {
        lobby: fakeLobbyId,
        actualPlayer: fakeActualPlayerId,
      } as unknown as Prisma.GameCreateInput
      // 2. Le dices al mock de Prisma: "Cuando te llamen con 'create', devuelve esto"
      prismaMock.game.create.mockResolvedValue(expectedGameOutput);

      // 3. Ejecutas el servicio pasándole tus IDs inventados
      const result = await service.createGame(CreateGameInput);

      // 4. Verificas que el resultado sea el esperado
      expect(result).toEqual(expectedGameOutput);
      expect(prismaMock.game.create).toHaveBeenCalledWith({
        data: {
          lobby: {
            connect: {id: 999}
          },
          actualPlayer: {
            connect: {id: 999}
          },
        }
      });
    })
    it('should throw an error if Prisma fails (e.g., lobby does not exist)', async () => {
    // 1. Preparamos los datos de entrada "incorrectos" o problemáticos
      const badGameData = {
        lobby: "9999", 
        actualPlayer: "9999",
      }   as unknown as Prisma.GameCreateInput; 

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'An operation failed because it depends on one or more records that were not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );

      prismaMock.game.create.mockRejectedValue(prismaError);

      await expect(service.createGame(badGameData)).rejects.toThrow(prismaError);

      expect(prismaMock.game.create).toHaveBeenCalledWith({
        data: {
          lobby: {
            connect: { id: 9999 } 
          },
          actualPlayer: {
            connect: {id: 9999 }
          }
        }
      });
    })
  })

  describe('updateGame', () => {
    
  })
});
