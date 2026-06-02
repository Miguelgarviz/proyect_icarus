import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Game, Tile, Ship, Player, Storage, DrillCard, Lobby } from '@backend/generated/prisma/client';
import { TileService } from '../tile/tile.service';

export const spaceStationLandings: Record<string, string[]> = {
    "space_station_1": ["void_16"],
    "space_station_2": ["red_planet_1"],
    "space_station_3": ["void_17"],
    "space_station_4": ["void_19"],
    "space_station_5": ["void_20"],
    "space_station_6": ["void_21"],
    "space_station_7": ["void_3"],
    "space_station_8": ["space_station_3", "void_24"],
    "space_station_9": ["void_10", "void_25"],
    "space_station_10": ["green_planet_7", "void_22"],
    "space_station_11": ["green_planet_8"],
    "space_station_12": ["red_planet_3"],
};

const goalValues: Record<string, number[]> = {
    "BEGINNER_I":[0,2,0],
    "BEGINNER_II":[2,2,0],
    "EASY_I":[0,0,1],
    "EASY_II":[1,1,1],
    "MEDIUM_I":[0,0,2],
    "MEDIUM_II":[0,2,2],
    "HARD_I":[2,2,2],
    "HARD_II":[0,3,3],
    "EXTREME_I":[0,4,4],
    "EXTREME_II":[0,0,6],
    "IMPOSSIBLE":[0,0,8]
}

@Injectable()
export class GameService {
    constructor(
        private prisma: PrismaService,
        private tileService: TileService
    ) {}
    

    async getGame(gameWhereUniqueInput: Prisma.GameWhereUniqueInput){
        return this.prisma.game.findUniqueOrThrow({
            where: gameWhereUniqueInput
        });
    }
    
    async createGame(data: Prisma.GameCreateInput) {
        return this.prisma.game.create({
            data:{
                lobby:{
                    connect: { id: Number(data.lobby) }
                },
                actualPlayerId: data.actualPlayerId
            }
        });
    }

    async updateGame(params: {
        where: Prisma.GameWhereUniqueInput;
        data: Prisma.GameUpdateInput;
    }) {
        const { where, data } = params;
        return this.prisma.game.update({
            data,
            where
        }); 
    }

    async setGameStore(where: Prisma.GameWhereUniqueInput, storeId: number) {
        return this.prisma.game.update({
            where: where,
            data: {
                storeId:storeId
            }
        });
    }

    async getStoreByGame(storeId: number){
        return this.prisma.store.findUniqueOrThrow({
            where:{
                id:storeId
            }
        })
    }
    
async movePlayer(tile: Tile, actualPlayer: Player) {
    let distance = 0;
    let validMove = false;
    const ship = await this.getShipFromPlayer(actualPlayer);
    
    const originTile = await this.tileService.getTilesByCoordinates(tile.gameId!, ship.positionX, ship.positionY);

    // --- CASO 1: MOVIMIENTO EN LA MISMA ÓRBITA ---
    if (tile.positionY === ship.positionY) {
        const start = { x: ship.positionX!, y: ship.positionY! };
        const end = { x: tile.positionX!, y: tile.positionY! };
        
        distance = await this.calculateDistance(start, end);
        distance = distance + await this.calculateNumberOfPlayersBetween(start, end, tile.gameId!, false);
        
        validMove = distance <= actualPlayer.movement;
    } 
    // --- CASO 2: TRANSBORDO DESDE ESTACIÓN ESPACIAL A OTRA ÓRBITA ---
    else if (ship.externalId.includes("space_station")) {
        const landingTilesId = spaceStationLandings[ship.externalId] || [];
        let connectionTileExternalId: string | undefined;
        
        for (const id of landingTilesId) {
            const possibleTile = await this.tileService.getTileByExternalId(id, tile.gameId!);
            if (possibleTile && possibleTile.positionY === tile.positionY) {
                connectionTileExternalId = id;
                break;
            }
        }

        if (connectionTileExternalId) {
            const startTile = await this.tileService.getTileByExternalId(connectionTileExternalId, tile.gameId!);
            const start = { x: startTile.positionX!, y: startTile.positionY! };
            const end = { x: tile.positionX!, y: tile.positionY! };
            
            // 1 punto base por cambiar de órbita + distancia en la nueva órbita
            distance = 1 + await this.calculateDistance(start, end);
            // checkStartTile = true porque entramos desde la estación a esa casilla y puede estar ocupada
            distance = distance + await this.calculateNumberOfPlayersBetween(start, end, tile.gameId!, true);
            
            validMove = distance <= actualPlayer.movement;
        }
    }
    
    if (validMove) {
        await this.prisma.ship.update({
            where: { id: ship.id },
            data: {
                positionX: tile.positionX,
                positionY: tile.positionY,
                externalId: tile.externalId
            }
        });

        await this.prisma.player.update({
            where: { id: actualPlayer.id },
            data: {
                movement: actualPlayer.movement - distance
            }
        });

        if (originTile) {
            await this.prisma.tile.update({
                where: { id: originTile.id },
                data: { ocupiedByPlayerId: null }
            });
        }

        await this.prisma.tile.update({
            where: { id: tile.id },
            data: { ocupiedByPlayerId: actualPlayer.id }
        });
    }
}

async calculateDistance(start: { x: number, y: number }, end: { x: number, y: number }) {
    const maxPlanetNum = [32, 16, 10];
    const distance1 = Math.abs(start.x - end.x);
    const distance2 =
        start.x > end.x
        ? end.x + (maxPlanetNum[end.y] - start.x)
        : start.x + (maxPlanetNum[end.y] - end.x);
    return Math.min(distance1, distance2);
}

async calculateNumberOfPlayersBetween(
    start: { x: number, y: number }, 
    end: { x: number, y: number },
    gameId: number,
    checkStartTile: boolean = false
) {
    if (start.y !== end.y) return 0;

    const maxPlanetNum = [32, 16, 10];
    const maxPositions = maxPlanetNum[start.y];
    let numPlayers = 0;

    // Si es la misma casilla exacta pero venimos de transbordo (checkStartTile = true)
    if (start.x === end.x) {
        if (checkStartTile) {
            const targetTile = await this.tileService.getTilesByCoordinates(gameId, start.x, start.y);
            if (targetTile && targetTile.ocupiedByPlayerId !== null) {
                return 1;
            }
        }
        return 0;
    }

    const diff = end.x - start.x;
    const clockwiseDistance = (diff + maxPositions) % maxPositions;
    const counterClockwiseDistance = (maxPositions - diff) % maxPositions;

    const isClockwise = clockwiseDistance <= counterClockwiseDistance;
    const steps = isClockwise ? clockwiseDistance : counterClockwiseDistance;

    // 1. Evaluar de forma extraordinaria la casilla inicial si entramos desde fuera (transbordo)
    if (checkStartTile) {
        const targetTile = await this.tileService.getTilesByCoordinates(gameId, start.x, start.y);
        if (targetTile && targetTile.ocupiedByPlayerId !== null) {
            numPlayers++;
        }
    }

    // 2. Recorrer el resto de las casillas intermedias
    for (let i = 1; i <= steps; i++) {
        let currentX = start.x;
        if (isClockwise) {
            currentX = (start.x + i) % maxPositions;
        } else {
            currentX = (start.x - i) % maxPositions;
            if (currentX < 0) currentX += maxPositions;
        }

        const targetTile = await this.tileService.getTilesByCoordinates(gameId, currentX, start.y);
        if (targetTile && targetTile.ocupiedByPlayerId !== null) {
            numPlayers++;
        }
    }

    return numPlayers;
}

async calculateMaxDistance(player: Player, ship: Ship, gameId: number, otherPlayers: Player[]) {
    const maxPlanetNum = [32, 16, 10];
    const maxPositions = maxPlanetNum[ship.positionY];
    const reachableTiles: Tile[] = [];

    if (player.movement === 0) return [];

    // Conjunto para guardar las coordenadas X válidas en la órbita actual
    const validXPositions = new Set<number>();

    // --- 1. SIMULACIÓN HACIA ADELANTE (SENTIDO HORARIO) ---
    let currentMovementClockwise = player.movement;
    let nextXClockwise = (ship.positionX + 1) % maxPositions;

    while (currentMovementClockwise > 0) {
        const targetTile = await this.tileService.getTilesByCoordinates(gameId, nextXClockwise, ship.positionY);
        const isOccupied = targetTile && targetTile.ocupiedByPlayerId !== null;

        // Coste básico de moverte a la casilla = 1
        let cost = 1;
        // Si hay una nave en medio, saltarla cuesta +1 de movimiento adicional (Total = 2)
        if (isOccupied) {
            cost += 1;
        }

        if (currentMovementClockwise >= cost) {
            // Si no está ocupada, es un destino válido donde la nave puede terminar su turno
            if (!isOccupied) {
                validXPositions.add(nextXClockwise);
            }
            currentMovementClockwise -= cost;
            nextXClockwise = (nextXClockwise + 1) % maxPositions;
        } else {
            // No queda suficiente movimiento para pagar esta casilla/salto
            break;
        }
    }

    // --- 2. SIMULACIÓN HACIA ATRÁS (SENTIDO ANTIHORARIO) ---
    let currentMovementCounter = player.movement;
    let nextXCounter = (ship.positionX - 1 + maxPositions) % maxPositions;

    while (currentMovementCounter > 0) {
        const targetTile = await this.tileService.getTilesByCoordinates(gameId, nextXCounter, ship.positionY);
        const isOccupied = targetTile && targetTile.ocupiedByPlayerId !== null;

        let cost = 1;
        if (isOccupied) {
            cost += 1;
        }

        if (currentMovementCounter >= cost) {
            if (!isOccupied) {
                validXPositions.add(nextXCounter);
            }
            currentMovementCounter -= cost;
            nextXCounter = (nextXCounter - 1 + maxPositions) % maxPositions;
        } else {
            break;
        }
    }

    // --- 3. RECOLECTAR LAS BALDOSAS DE LA ÓRBITA ACTUAL ---
    for (const x of validXPositions) {
        const tile = await this.tileService.getTilesByCoordinates(gameId, x, ship.positionY);
        if (tile) reachableTiles.push(tile);
    }

    // --- 4. CONEXIÓN CON ESTACIONES ESPACIALES ---
    // (Esta sección se queda exactamente igual a como la tenías en tu código original o en la última versión, ya que el problema estaba solo en el movimiento lineal de órbita)
    if (ship.externalId.includes("space_station")) {
        const landingTilesId = spaceStationLandings[ship.externalId] || [];
        
        for (const landingTileId of landingTilesId) {
            const tile = await this.tileService.getTileByExternalId(landingTileId, gameId);
            if (!tile) continue;

            const tileY = tile.positionY;
            const targetMaxPositions = maxPlanetNum[tileY];

            const remainingMovement = player.movement - 1;
            if (remainingMovement <= 0) {
                if (tile.ocupiedByPlayerId === null) reachableTiles.push(tile);
                continue;
            }

            const isLandingOccupied = tile.ocupiedByPlayerId !== null;
            const movementAfterLanding = remainingMovement - (isLandingOccupied ? 1 : 0);

            if (movementAfterLanding <= 0) continue; 

            let rawDir3 = tile.positionX - movementAfterLanding;
            if (rawDir3 < 0) rawDir3 += targetMaxPositions;
            let rawDir4 = (tile.positionX + movementAfterLanding) % targetMaxPositions;

            const obstaclesDir3 = await this.calculateNumberOfPlayersBetween({ x: tile.positionX, y: tileY }, { x: rawDir3, y: tileY }, gameId, false);
            const obstaclesDir4 = await this.calculateNumberOfPlayersBetween({ x: tile.positionX, y: tileY }, { x: rawDir4, y: tileY }, gameId, false);

            let dir3 = (rawDir3 + obstaclesDir3) % targetMaxPositions;
            let dir4 = (rawDir4 - obstaclesDir4) % targetMaxPositions;
            if (dir4 < 0) dir4 += targetMaxPositions;

            let currentX2 = dir3;
            const subTilesToQuery: number[] = [];
            while (currentX2 !== dir4) {
                if (currentX2 !== tile.positionX || !isLandingOccupied) subTilesToQuery.push(currentX2);
                currentX2 = (currentX2 + 1) % targetMaxPositions;
            }
            if (dir4 !== tile.positionX || !isLandingOccupied) subTilesToQuery.push(dir4);

            for (const numTile2 of subTilesToQuery) {
                const otherTile = await this.tileService.getTilesByCoordinates(gameId, numTile2, tileY);
                if (otherTile && !reachableTiles.some(t => t.id === otherTile.id)) reachableTiles.push(otherTile);
            }
        }
    }

    return reachableTiles;
}

    async getShipFromPlayer(player: Player){
        return this.prisma.ship.findUniqueOrThrow({
            where:{id: player.shipId!}
        })
    }

    async nextPlayer(player: Player, game: Game){
        const ship = await this.getShipFromPlayer(player)
        await this.prisma.player.update({
            where: {id: player.id},
            data:{
                movement: ship.engine
            }
        })
        await this.prisma.game.update({
            where:{id: game.id},
            data:{
                actualPlayerId: player.id
            }
        })
        await this.prisma.ship.update({
            where: {id: ship.id},
            data: {
                engineUpgraded: false
            }
        })
    }

    

    async upgradeShield(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                shield:{increment: 1}
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {green: {decrement: 1}}
        })
    }

    async upgradeDrill(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                drill:{increment: 1}
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {green: {decrement: 1}}
        })
    }
    async upgradeEngine(ship: Ship, storage: Storage){
        await this.prisma.ship.update({
            where:{
                id: ship.id
            },
            data:{
                engine:{increment: 1},
                engineUpgraded: true
            }
        })
        await this.prisma.storage.update({
            where: {id: storage.id},
            data: {red: {decrement: 1}}
        })
    }

    async increaseSupernovaLvL(game: Game){
        await this.prisma.game.update({
            where: {id: game.id},
            data: {
                supernovaLvL: {increment: 1}
            }
        })
    }

    async haveAchivedGoal(lobby: Lobby, storage: Storage){
        const goal = goalValues[lobby.dificulty.toString()]
        const storageValues:[number,number,number] = [storage.green,storage.red,storage.yellow]

        const greenGoal = goal[0]=== 0 || storage.green >= goal[0];
        const redGoal = goal[1]=== 0 || storage.red >= goal[1];
        const yellowGoal = goal[2]=== 0 || storage.yellow >= goal[2];

        return greenGoal && redGoal && yellowGoal;
    }

}
