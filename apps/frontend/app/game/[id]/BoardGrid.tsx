// apps/frontend/app/game/BoardGrid.tsx
"use client";

import { greenPlanetNodes, redPlanetNodes, yellowPlanetNodes,  initialNodes, stationNodes, novaTracks, TileMap, TrackMap, voidNodes} from './mapData';
import styles from './game.module.css';

interface BoardGridProps {
  // Por si necesito luego hacer cosas concretas luego de pulsar el tile
  onNodeClick: (id: string) => void;
}

export default function BoardGrid({ onNodeClick }: BoardGridProps) {
  const renderTiles = (tileList: TileMap[]) => {
  return tileList.map((node) => (
    <ellipse
      key={node.id}
      cx={node.cx}
      cy={node.cy}
      rx={node.rx}
      ry={node.ry}
      type={node.type}
      className={styles.interactable}
      onClick={() => console.log("Nodo clickeado:", node.id, "Tipo:", node.type)}
    />
  ));
};

const renderTracks = (trackList: TrackMap[]) => {
  return trackList.map((rect) => (
    <rect
      key={rect.id}
      x={rect.x}
      y={rect.y}
      width={rect.w}
      height={rect.h}
      className={styles.interactable}
      onClick={() => console.log("Track clickeado:", rect.id)}
    />
  ));
};
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    
    point.x = e.clientX;
    point.y = e.clientY;
    
    // Esto convierte el clic de la pantalla a la coordenada interna del SVG
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    
    console.log(`Nueva coordenada: cx="${svgPoint.x.toFixed(1)}" cy="${svgPoint.y.toFixed(1)}"`);
    // O si es un track: x="${svgPoint.x.toFixed(1)}" y="${svgPoint.y.toFixed(1)}"
  };
  return (
    
    <svg 
      viewBox="0 0 1790 1787" 
      className={styles.svgOverlay}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Renderizamos los planetas dinámicamente */}
      {renderTiles(greenPlanetNodes)}
      {renderTiles(redPlanetNodes)}
      {renderTiles(yellowPlanetNodes)}
      {renderTiles(initialNodes)}
      {renderTiles(stationNodes)}
      {renderTiles(voidNodes)}

      {/* Renderizamos el track de puntuación */}
      {renderTracks(novaTracks)}
    </svg>
  );
}