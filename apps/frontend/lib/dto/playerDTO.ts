export interface PlayerDTO {
  id: string;
  name: string;
  color: string;
  movement: number;
  storageId: number;
  shipId: number;
  turnOrder: number;
  isDead: boolean;
}
export interface PlayerChipDTO {
  id: string;
  color: string;
  coordX: number;
  coordY: number;
  externalId: string;
}
