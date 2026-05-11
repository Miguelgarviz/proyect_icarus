export interface PlayerDTO {
    id: string;
    name: string;
    color: string;
    movement: number;
}
export interface PlayerChip {
    id:string;
    color: string;
    coordX: number;
    coordY: number;
    externalId: string;
}