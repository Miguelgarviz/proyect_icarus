enum TileTypeDTO {
    EMPTY,
    GREEN,
    RED,
    YELLOW,
    SPACE_STATION,
    START
}

export interface TileDTO {
    id: string;

    externalId: string;

    type: TileTypeDTO
    positionX: number;
    positionY: number;

    drillAttempts: number;
    gameId: number;
}