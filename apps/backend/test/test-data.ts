import { PrismaService } from '../src/prisma/prisma.service';
import {
    CardType,
    Dificulty,
    TileType,
    Game,
    Lobby,
    Player,
    Ship,
    Storage,
    Store,
    Tile,
    DrillCard
} from '../src/generated/prisma/client';

/**
 * Datos que devuelve el seed.
 *
 * Los tests pueden utilizar estos objetos para saber exactamente
 * qué jugadores, naves y tiles se han creado.
 */
export interface TestData {
    game: Game;
    game2: Game;

    lobby1: Lobby;
    lobby2: Lobby;
    lobby3: Lobby;

    player1: Player;
    player2: Player;
    player3: Player;
    player4: Player;

    ship1: Ship;
    ship2: Ship;
    ship3: Ship;

    storage1: Storage;
    storage2: Storage;
    storage3: Storage;

    store1: Store;
    store2: Store;

    drillCards: DrillCard[];

    tiles: Tile[];
}

/**
 * Elimina todos los datos de la base de datos de test.
 *
 * El orden es importante debido a las relaciones entre las tablas.
 */
export async function clearTestDatabase(
  prisma: PrismaService,
): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Card",
      "DrillCard",
      "Tile",
      "Game",
      "Player",
      "Ship",
      "Storage",
      "Store",
      "Lobby"
    RESTART IDENTITY CASCADE;
  `);
}

/**
 * Crea una partida completa de prueba.
 *
 * La estructura creada es:
 *
 * Lobby 1
 *   ├── Player 1
 *   │     ├── Ship 1
 *   │     └── Storage 1
 *   │
 *   └── Player 2
 *         ├── Ship 2
 *         └── Storage 2
 * 
 * Lobby 2
 *   └── Player 3
 *         ├── Ship 3
 *         └── Storage 3
 * 
 * Lobby 3
 *   └── Player 4
 * 
 * Game
 *   ├── Lobby 1
 *   ├── Player 1 como actualPlayer
 *   ├── Store 1
 *   ├── DrillCards
 *   └── 58 Tiles
 * 
 * Game 2
 *   ├── Lobby 3
 *   ├── Player 4 como actualPlayer
 *   └── Store 3
 * 
 * Store 2 (sin Cards)
 */
export async function seedTestDatabase(
    prisma: PrismaService,
): Promise<TestData> {
    /*
     * Por seguridad, limpiamos primero.
     *
     * Así seedTestDatabase() siempre parte de un estado conocido,
     * independientemente de lo que haya quedado de una ejecución anterior.
     */
    await clearTestDatabase(prisma);

    // ---------------------------------------------------------
    // LOBBY
    // ---------------------------------------------------------

    const lobby1 = await prisma.lobby.create({
        data: {
            dificulty: Dificulty.EASY_II,
            numPlayers: 2,
        },
    });

    const lobby2 = await prisma.lobby.create({
        data: {
            dificulty: Dificulty.EASY_II,
            numPlayers: 1
        }
    })

    const lobby3 = await prisma.lobby.create({
        data: {
            dificulty: Dificulty.EXTREME_II,
            numPlayers: 1,
        }
    })

    // ---------------------------------------------------------
    // SHIPS
    // ---------------------------------------------------------

    const ship1 = await prisma.ship.create({
        data: {
            externalId: 'void_2',
            positionX: 2,
            positionY: 0,
            engine: 4,
            shield: 7,
            drill: 7,
        },
    });

    const ship2 = await prisma.ship.create({
        data: {
            externalId: 'red_planet_1',
            positionX: 0,
            positionY: 1,
            engine: 4,
            shield: 10,
            drill: 10,
        },
    });

    const ship3 = await prisma.ship.create({
        data: {
            externalId: 'ship_test_3',
            positionX: 0,
            positionY: 0,
            engine: 5,
            shield: 10,
            drill: 10,
        }
    })


    // ---------------------------------------------------------
    // STORAGE
    // ---------------------------------------------------------

    const storage1 = await prisma.storage.create({
        data: {
            green: 4,
            red: 1,
            yellow: 1,
        },
    });

    const storage2 = await prisma.storage.create({
        data: {
            green: 10,
            red: 10,
            yellow: 10,
        },
    });

    const storage3 = await prisma.storage.create({
        data: {
            green: 0,
            red: 0,
            yellow: 0,
        },
    });


    // ---------------------------------------------------------
    // PLAYERS
    // ---------------------------------------------------------

    const player1 = await prisma.player.create({
        data: {
            movement: 4,
            name: 'TestPlayer1',
            color: '#ef4444',
            turnOrder: 0,

            lobby: {
                connect: {
                    id: lobby1.id,
                },
            },

            ship: {
                connect: {
                    id: ship1.id,
                },
            },

            storage: {
                connect: {
                    id: storage1.id,
                },
            },
        },
    });

    const player2 = await prisma.player.create({
        data: {
            movement: 4,
            name: 'TestPlayer2',
            color: '#3b82f6',
            turnOrder: 1,

            lobby: {
                connect: {
                    id: lobby1.id,
                },
            },

            ship: {
                connect: {
                    id: ship2.id,
                },
            },

            storage: {
                connect: {
                    id: storage2.id,
                },
            },
        },
    });

    const player3 = await prisma.player.create({
        data: {
            movement: 5,
            name: 'TestPlayer3',
            color: '#10b981',
            turnOrder: 2,

            lobby: {
                connect: {
                    id: lobby2.id,
                },
            },

            ship: {
                connect: {
                    id: ship3.id,
                },
            },

            storage: {
                connect: {
                    id: storage3.id,
                },
            },
        },
    });

    const player4 = await prisma.player.create({
        data: {
            movement: 3,
            name: 'TestPlayer4',
            color: '#fffb00',
            turnOrder: 0,

            lobby: {
                connect: {
                    id: lobby3.id,
                },
            }
        },
    });

    // ---------------------------------------------------------
    // STORE
    // ---------------------------------------------------------

    const store1 = await prisma.store.create({
        data: {
            numCards: 18,
        },
    });

    const store2 = await prisma.store.create({
        data: {
            numCards: 18,
        }
    })

    const store3 = await prisma.store.create({
        data: {
            numCards: 18
        }
    })

    // ---------------------------------------------------------
    // CARDS
    // ---------------------------------------------------------

    await prisma.card.createMany({
        data: [
            {
                cost: 1,
                type: CardType.TEMPORARY_PATCH,
                storeId: store1.id,
            },
            {
                cost: 1,
                type: CardType.NEW_DRILL,
                storeId: store1.id,
            },
            {
                cost: 1,
                type: CardType.BACKUP_POWER,
                storeId: store1.id,
            },
            {
                cost: 2,
                type: CardType.SLINGSHOT,
                storeId: store1.id,
            },
            {
                cost: 2,
                type: CardType.ENHANCED_SCANNER,
                storeId: store1.id,
            },
            {
                cost: 2,
                type: CardType.ROCKET_THRUSTERS,
                storeId: store1.id,
            },
            {
                cost: 2,
                type: CardType.ENHANCED_SCANNER,
                playerId: player1.id
            },
            {
                cost: 2,
                type: CardType.ROCKET_THRUSTERS,
                playerId: player1.id
            },
        ],
    });

    
    // ---------------------------------------------------------
    // GAME
    // ---------------------------------------------------------

    const game = await prisma.game.create({
        data: {
            lobby: {
                connect: {
                    id: lobby1.id,
                },
            },

            actualPlayer: {
                connect: {
                    id: player1.id,
                },
            },

            store: {
                connect: {
                    id: store1.id,
                },
            },

            round: 0,
            supernovaLvL: 0,
        },
    });

    const game2 = await prisma.game.create({
        data: {
            lobby: {
                connect: {
                    id: lobby3.id,
                },
            },

            actualPlayer: {
                connect: {
                    id: player4.id,
                },
            },

            store: {
                connect: {
                    id: store3.id,
                },
            },

            round: 0,
            supernovaLvL: 0,
        },
    });

    // ---------------------------------------------------------
    // DRILLCARDS
    // ---------------------------------------------------------

    const drillCards: DrillCard[] = await prisma.drillCard.createManyAndReturn({
        data: [
            {
                greenResources: 4,
                redResources: 2,
                yellowResources: 1,
                gameId: game.id
            },
            {
                greenResources: 1,
                redResources: 0,
                yellowResources: 0,
                gameId: game.id
            },
            {
                greenResources: 0,
                redResources: 1,
                yellowResources: 0,
                gameId: game.id
            },
            {
                greenResources: 0,
                redResources: 0,
                yellowResources: 1,
                gameId: game.id
            },
            {
                greenResources: 0,
                redResources: 0,
                yellowResources: 0,
                isSupernovaCard: true,
                gameId: game.id
            },
            {
                greenResources: 4,
                redResources: 4,
                yellowResources: 2,
                gameId: game.id
            }
        ]
    })

    // ---------------------------------------------------------
    // TILES
    // ---------------------------------------------------------

    const tiles: Tile[] = [];

    /*
     * Órbita 0
     * ----------
     * 32 posiciones
     *
     * Utilizamos void_0 ... void_31 como identificadores base.
     *
     * Además sustituimos algunas posiciones por las Tiles especiales
     * que utiliza actualmente GameService para las estaciones espaciales.
     */

    const orbit0ExternalIds: string[] = Array.from(
        { length: 32 },
        (_, x) => `void_${x}`,
    );

    /*
     * Estas son las estaciones que GameService utiliza actualmente
     * en spaceStationLandings.
     *
     * Las colocamos en posiciones conocidas de la primera órbita.
     */
    const stations = new Map<number, string>([
        [16, 'space_station_1'],
        [17, 'space_station_3'],
        [18, 'space_station_4'],
        [19, 'space_station_5'],
        [20, 'space_station_6'],
        [21, 'space_station_7'],
        [22, 'space_station_8'],
        [23, 'space_station_9'],
        [24, 'space_station_10'],
        [25, 'space_station_11'],
        [26, 'space_station_12'],
        [0, 'space_station_2'],
    ]);

    for (let x = 0; x < 32; x++) {
        const externalId =
            stations.get(x) ?? orbit0ExternalIds[x];

        const tile = await prisma.tile.create({
            data: {
                externalId,
                type: stations.has(x)
                    ? TileType.SPACE_STATION
                    : TileType.EMPTY,
                positionX: x,
                positionY: 0,
                drillAttempts: 0,
                gameId: game.id,
            },
        });

        tiles.push(tile);
    }
    
    /*
     * Órbita 1
     * ----------
     * 16 posiciones.
     *
     * Algunas Tiles reciben nombres que GameService utiliza
     * como destinos de las estaciones espaciales.
     */
    const orbit1SpecialIds = new Map<number, string>([
        [0, 'red_planet_1'],
        [1, 'red_planet_3'],
        [15, 'green_planet_7'],
        [8, 'green_planet_8'],
    ]);

    for (let x = 0; x < 16; x++) {
        const externalId =
            orbit1SpecialIds.get(x) ?? `orbit1_${x}`;

        let type: TileType = TileType.EMPTY;

        if (externalId.startsWith('red_planet')) {
            type = TileType.RED;
        } else if (externalId.startsWith('green_planet')) {
            type = TileType.GREEN;
        }

        const tile = await prisma.tile.create({
            data: {
                externalId,
                type,
                positionX: x,
                positionY: 1,
                drillAttempts: 0,
                gameId: game.id,
            },
        });

        tiles.push(tile);
    }

    /*
     * Órbita 2
     * ----------
     * 10 posiciones.
     */
    for (let x = 0; x < 10; x++) {
        const tile = await prisma.tile.create({
            data: {
                externalId: `orbit2_${x}`,
                type: TileType.EMPTY,
                positionX: x,
                positionY: 2,
                drillAttempts: 0,
                gameId: game.id,
            },
        });

        tiles.push(tile);
    }

    // ---------------------------------------------------------
    // OCUPACIÓN INICIAL
    // ---------------------------------------------------------

    /*
     * La nave 1 empieza en:
     *
     *     (0, 0)
     *
     * La nave 2 empieza en:
     *
     *     (5, 0)
     *
     * Marcamos las Tiles correspondientes como ocupadas.
     */

    const player1Tile = tiles.find(
        tile => tile.positionX === 2 && tile.positionY === 0,
    );

    const player2Tile = tiles.find(
        tile => tile.positionX === 0 && tile.positionY === 1,
    );


    if (!player1Tile || !player2Tile) {
        throw new Error(
            'No se encontraron las Tiles iniciales de los jugadores.',
        );
    }

    await prisma.tile.update({
        where: {
            id: player1Tile.id,
        },
        data: {
            ocupiedByPlayerId: player1.id,
        },
    });

    await prisma.tile.update({
        where: {
            id: player2Tile.id,
        },
        data: {
            ocupiedByPlayerId: player2.id,
        },
    });


    // Actualizamos los objetos devueltos para que los tests
    // tengan la información de ocupación actual.
    player1Tile.ocupiedByPlayerId = player1.id;
    player2Tile.ocupiedByPlayerId = player2.id;

    return {
        game,
        game2,
        lobby1,
        lobby2,
        lobby3,
        player1,
        player2,
        player3,
        player4,
        ship1,
        ship2,
        ship3,
        storage1,
        storage2,
        storage3,
        store1,
        store2,
        drillCards,
        tiles,
    };
}