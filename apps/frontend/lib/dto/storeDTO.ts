export enum CardTypeDTO {
  TEMPORARY_PATCH,
  NEW_DRILL,
  BACKUP_POWER,
  SLINGSHOT,
  ENHANCED_SCANNER,
  ROCKET_THRUSTERS
}

export interface StoreDTO {
    id: string;
    numCards: number;

}

export interface CardDTO {
    id: string;
    playerId: string | null;
    storeId: string | null;
    cost: number;
    type: CardTypeDTO;
}

