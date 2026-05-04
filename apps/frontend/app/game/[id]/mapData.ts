// apps/frontend/app/game/mapData.ts
export interface TileMap {
    id:string,
    cx:number,
    cy:number,
    rx:number,
    ry:number,
    type:string
}
export interface TrackMap {
    id:string,
    x:number,
    y:number,
    w:number,
    h:number
}
export const greenPlanetNodes: TileMap[] = [
    { id: 'green_planet_2', cx: 627, cy: 222, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_3', cx: 202.5, cy: 745, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_4', cx: 247, cy: 1155, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_5', cx: 757, cy: 1574.5, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_6', cx: 1289.5, cy: 1465, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_7', cx: 1598.6, cy: 879.7, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_1', cx: 1394, cy: 383, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_9', cx: 560, cy: 550, rx: 62.5, ry: 59, type: 'green_planet' },
    { id: 'green_planet_8', cx: 1365, cy: 878, rx: 62.5, ry: 59, type: 'green_planet' }
];

export const redPlanetNodes: TileMap[] = [
    { id: 'red_planet_2', cx: 705, cy: 450, rx: 62.5, ry: 62.5, type: 'red_planet' },
    { id: 'red_planet_3', cx: 560, cy: 1220, rx: 62.5, ry: 62.5, type: 'red_planet' },
    { id: 'red_planet_4', cx: 1230, cy: 1217, rx: 62.5, ry: 62.5, type: 'red_planet' },
    { id: 'red_planet_1', cx: 1230, cy: 552.5, rx: 62.5, ry: 62.5, type: 'red_planet' },
    { id: 'red_planet_5', cx: 1175, cy: 878.5, rx: 62.5, ry: 62.5, type: 'red_planet' }

];

export const yellowPlanetNodes: TileMap[] = [
    { id: 'yellow_planet_1', cx: 975.5, cy: 615, rx: 62.5, ry:62.5, type: 'yellow_planet' },
    { id: 'yellow_planet_2', cx: 615, cy: 886.5, rx: 62.5, ry: 62.5, type: 'yellow_planet' },
    { id: 'yellow_planet_3', cx: 988, cy: 1152.5, rx: 62.6, ry: 62.5, type: 'yellow_planet' }
];

export const initialNodes: TileMap[] = [
    { id: 'initial_1', cx: 1480, cy: 493, rx: 74.5, ry: 73.5, type: 'initial'},
    { id: 'initial_2', cx: 310.5, cy: 1275, rx: 73.5, ry: 73.5, type: 'initial'},
    { id: 'initial_3', cx: 308.5, cy: 491.5, rx: 74.5, ry: 75, type: 'initial'},
    { id: 'initial_4', cx: 1479.5, cy: 1272, rx: 75.5, ry: 73.5, type: 'initial'}
];

export const stationNodes: TileMap[] = [
    {id: 'space_station_2', cx: 502.5, cy: 296, rx:56, ry:54.5, type: 'space_station'},
    {id: 'space_station_3', cx: 190, cy: 882.5, rx:56, ry:54.5, type: 'space_station'},
    {id: 'space_station_4', cx: 627.5, cy: 1535, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_5', cx: 1163, cy: 1536, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_6', cx: 1587.5, cy: 1015, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_1', cx: 1285, cy: 300, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_7', cx: 1330, cy: 705, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_8', cx: 895, cy: 410, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_9', cx: 458, cy: 1063, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_10', cx: 895, cy: 1350, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_12', cx: 1125, cy: 1045, rx:62.5, ry:62.5, type: 'space_station'},
    {id: 'space_station_11', cx: 807, cy: 613, rx:62.5, ry:62.5, type: 'space_station'}
]

export const novaTracks: TrackMap[] = [
  { id: 'track_0', x: 90, y: 1702, w: 57, h: 57 },
  {id: 'track_1', x: 168, y: 1702, w: 57, h: 57},
  {id: 'track_2', x: 246, y: 1702, w: 57, h: 57},
  {id: 'track_3', x: 324, y: 1702, w: 57, h: 57},
  {id: 'track_4', x: 402, y: 1702, w: 57, h: 57},
  {id: 'track_5', x: 480, y: 1702, w: 57, h: 57},
  {id: 'track_6', x: 558, y: 1702, w: 57, h: 57},
  {id: 'track_7', x: 636, y: 1702, w: 57, h: 57},
  {id: 'track_8', x: 714, y: 1702, w: 57, h: 57},
  {id: 'track_9', x: 788, y: 1702, w: 57, h: 57},
  {id: 'track_10', x: 865, y: 1702, w: 57, h: 57},
  {id: 'track_11', x: 940, y: 1702, w: 57, h: 57},
  {id: 'track_12', x: 1020, y: 1702, w: 57, h: 57},
  {id: 'track_13', x: 1098, y: 1702, w: 57, h: 57},
  {id: 'track_14', x: 1175, y: 1702, w: 57, h: 57},
  {id: 'track_15', x: 1250, y: 1702, w: 57, h: 57},
  {id: 'track_16', x: 1328, y: 1702, w: 57, h: 57},
  {id: 'track_17', x: 1407, y: 1702, w: 57, h: 57},
  {id: 'track_18', x: 1483, y: 1702, w: 57, h: 57},
  {id: 'track_19', x: 1563, y: 1702, w: 57, h: 57},
  {id: 'track_20', x: 1639, y: 1702, w: 57, h: 57}
];

export const voidNodes: TileMap[] = [
    {id: 'void_14', cx: 1585, cy: 747.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_15', cx: 1545, cy: 615, rx: 48, ry: 48, type:'void'},
    {id: 'void_1', cx: 1163.5, cy: 233.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_2', cx: 1031.5, cy: 192.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_3', cx: 895, cy: 178, rx: 48, ry: 48, type:'void'},
    {id: 'void_4', cx: 756, cy: 193.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_5', cx: 396, cy: 385, rx: 48, ry: 48, type:'void'},
    {id: 'void_6', cx: 243, cy: 612.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_7', cx: 205, cy: 1020, rx: 48, ry: 48, type:'void'},
    {id: 'void_8', cx: 398.5, cy: 1382.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_9', cx: 504, cy: 1470, rx: 48, ry: 48, type:'void'},
    {id: 'void_10', cx: 895, cy: 1587.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_11', cx: 1032, cy: 1572.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_12', cx: 1390, cy: 1381.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_13', cx: 1545, cy: 1150, rx: 48, ry: 48, type:'void'},
    {id: 'void_21', cx: 1330, cy: 1061, rx: 48, ry: 48, type:'void'},
    {id: 'void_16', cx: 1075, cy: 447.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_17', cx: 457.5, cy: 702.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_18', cx: 422.5, cy: 882.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_19', cx: 716.3, cy: 1318, rx: 48, ry: 48, type:'void'},
    {id: 'void_20', cx: 1075, cy: 1317.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_22', cx: 1123, cy: 718.5, rx: 48, ry: 48, type:'void'},
    {id: 'void_23', cx: 665, cy: 716, rx: 48, ry: 48, type:'void'},
    {id: 'void_24', cx: 668, cy: 1048, rx: 48, ry: 48, type:'void'},
    {id: 'void_25', cx: 809.4, cy: 1152.5, rx: 48, ry: 48, type:'void'}
];