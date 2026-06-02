export interface PlayerDTO {
  id: string;
  name: string;
  color: string;
  movement: number;
  storageId: number;
  shipId: number;
  turnOrder: number;
  isDead: boolean;
  initialHelp: boolean;
}
export interface PlayerChipDTO {
  id: string;
  name: string;
  color: string;
  coordX: number;
  coordY: number;
  externalId: string;
}
